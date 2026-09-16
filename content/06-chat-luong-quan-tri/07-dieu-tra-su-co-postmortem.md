---
title: Điều tra sự cố dữ liệu & postmortem
tagline: Từ "số sai" đến nguyên nhân gốc trong 30 phút, và không lặp lại
tools:
  - Root cause analysis
  - Lineage
  - Bisect
  - Timeline
  - Blameless postmortem
weight: 4
---

"Dashboard sai" là triệu chứng. Quy trình đi ngược lineage để tìm nơi sai bắt đầu:

1. **Xác định phạm vi**: bảng nào, cột nào, từ ngày nào, lệch bao nhiêu. So với một nguồn độc lập nếu có.
2. **Đi ngược lineage**: mart → intermediate → staging → raw. Ở mỗi lớp chạy cùng một kiểm tra (đếm, tổng). Lớp đầu tiên sai là nơi bug nằm hoặc nơi nó đi vào.
3. **Bisect theo thời gian**: chạy lại pipeline cho một ngày đúng và một ngày sai với cùng code → nếu ngày đúng vẫn đúng, lỗi ở dữ liệu nguồn; nếu ngày đúng nay sai, lỗi ở code vừa đổi. Xem git log và lịch deploy.
4. **Kiểm tra "cái gì đã đổi"**: code, schema nguồn, cấu hình Airflow, phiên bản thư viện, dữ liệu đến trễ, backfill ai đó vừa chạy.
5. **Sửa + backfill + xác nhận** với người báo lỗi bằng con số.

```sql
-- Đối chiếu từng lớp cho một ngày để tìm lớp đầu tiên lệch
SELECT 'raw' AS layer, COUNT(*) AS n, SUM(SAFE_CAST(amount AS NUMERIC)) AS total FROM raw.orders WHERE DATE(created_at) = '2025-06-15'
UNION ALL SELECT 'staging', COUNT(*), SUM(amount) FROM staging.stg_orders WHERE order_date = '2025-06-15'
UNION ALL SELECT 'mart', COUNT(*), SUM(order_total) FROM marts.fct_orders WHERE order_date = '2025-06-15';
```

## Postmortem (trong 48 giờ, một trang)

- Dòng thời gian: phát hiện lúc nào, bởi ai (người dùng hay hệ thống?), khắc phục lúc nào.
- Nguyên nhân gốc — hỏi "vì sao" tới khi ra lỗi **hệ thống**, không phải lỗi người ("vì không có test schema ở raw", không phải "vì A quên").
- Tác động: ai đã dùng số sai, quyết định nào bị ảnh hưởng.
- Hành động: mỗi hành động có người và hạn; ít nhất một hành động là **phát hiện sớm hơn** (test/alert), không chỉ sửa nguyên nhân.

## Sai lầm hay gặp

- Sửa số bằng tay cho kịp họp rồi không tìm nguyên nhân → tuần sau lặp lại.
- Điều tra từ raw lên (tốn) thay vì từ mart xuống.
- Postmortem chỉ có hành động "cẩn thận hơn" — không đo được, không ai làm.
