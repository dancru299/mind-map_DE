---
title: Migration không dừng hệ thống
tagline: Đổi warehouse, đổi orchestrator, đổi model — trong khi báo cáo vẫn chạy mỗi sáng
tools:
  - Strangler pattern
  - Dual-write / dual-run
  - Parallel validation
  - Cutover
  - Deprecation
weight: 3
---

Migration (Redshift → BigQuery, cron → Airflow, bảng cũ → model mới) là nơi DE mất nhiều đêm nhất — vì hệ thống cũ không được dừng, và "giống hệt" là tiêu chí khó chứng minh.

## Quy trình

1. **Kiểm kê**: bảng/pipeline nào đang có, ai dùng (lineage + audit log), cái nào không ai dùng → **bỏ trước khi chuyển** (thường 30–50%).
2. **Chạy song song** (dual-run): hệ thống mới chạy cùng lịch với cũ, ghi ra nơi riêng, **chưa ai dùng**.
3. **Đối chiếu tự động** mỗi ngày: số dòng, tổng theo cột số, hash theo khoá, so từng bảng. Lệch → sửa → chạy tiếp. Chấp nhận khi khớp N ngày liên tiếp.
4. **Chuyển người dùng theo nhóm** (strangler): dashboard ít quan trọng trước, tài chính sau cùng. Mỗi nhóm có ngày cutover và cách quay lại.
5. **Giữ hệ thống cũ ở chế độ đọc** một thời gian, rồi tắt theo lịch đã thông báo (deprecation notice có ngày).

```sql
-- Đối chiếu hai hệ thống cho một ngày: khớp số dòng và tổng theo từng nhóm
WITH old AS (SELECT region, COUNT(*) n, SUM(amount) s FROM old_wh.fct_orders WHERE order_date = '2025-06-15' GROUP BY 1),
     new AS (SELECT region, COUNT(*) n, SUM(amount) s FROM new_wh.fct_orders WHERE order_date = '2025-06-15' GROUP BY 1)
SELECT COALESCE(old.region, new.region) region, old.n, new.n, old.s, new.s,
       ABS(COALESCE(old.s, 0) - COALESCE(new.s, 0)) AS diff
FROM old FULL OUTER JOIN new USING (region)
WHERE old.n IS DISTINCT FROM new.n OR ABS(COALESCE(old.s, 0) - COALESCE(new.s, 0)) > 0.01;
```

Đổi model dữ liệu (không đổi hệ thống) dùng cùng cách: bảng mới `fct_orders_v2` chạy song song, đối chiếu, chuyển dashboard, rồi đổi tên.

## Sai lầm hay gặp

- Big-bang cutover cuối tuần → thứ Hai mọi dashboard sai, không có đường lùi.
- Chuyển cả bảng không ai dùng ("để cho đủ") → gấp đôi công.
- "Khớp" bằng mắt trên vài bảng thay vì đối chiếu tự động toàn bộ.
- Không có ngày tắt hệ thống cũ → chạy song song 2 năm, trả tiền gấp đôi.
