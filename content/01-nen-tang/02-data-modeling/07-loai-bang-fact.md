---
title: Ba loại bảng fact
tagline: Transaction, periodic snapshot, accumulating snapshot — mỗi loại trả lời một kiểu câu hỏi
tools:
  - Transaction fact
  - Periodic snapshot
  - Accumulating snapshot
  - Factless fact
weight: 4
---

| Loại | Một dòng = | Trả lời câu hỏi | Ví dụ |
|---|---|---|---|
| **Transaction** | một sự kiện xảy ra | "Bao nhiêu… trong khoảng thời gian?" | Mỗi đơn hàng, mỗi giao dịch, mỗi click |
| **Periodic snapshot** | trạng thái tại cuối mỗi kỳ | "Tại thời điểm X, tình hình ra sao?" | Số dư tài khoản cuối ngày, tồn kho cuối tuần |
| **Accumulating snapshot** | một quy trình, cập nhật khi đi qua các mốc | "Mất bao lâu từ bước A đến B?" | Đơn hàng: đặt → thanh toán → giao → nhận; hồ sơ vay: nộp → duyệt → giải ngân |

Transaction fact chỉ **append**; hai loại còn lại có dòng bị **cập nhật** — ảnh hưởng thẳng tới cách viết pipeline (incremental theo append hay `MERGE`).

```sql
-- Accumulating snapshot: một dòng mỗi đơn, các cột mốc được điền dần
CREATE TABLE fct_order_fulfillment (
  order_id        STRING,
  ordered_at      TIMESTAMP,
  paid_at         TIMESTAMP,   -- NULL cho tới khi thanh toán
  shipped_at      TIMESTAMP,
  delivered_at    TIMESTAMP,
  hours_to_ship   INT64        -- TIMESTAMP_DIFF(shipped_at, paid_at, HOUR), tính khi có đủ hai mốc
);
```

**Factless fact**: bảng fact không có số đo, chỉ ghi "sự kiện đã xảy ra" (sinh viên đăng ký môn học, sản phẩm được khuyến mãi ngày nào). Đếm dòng chính là số đo.

## Sai lầm hay gặp

- Dùng transaction fact để trả lời câu hỏi trạng thái ("tồn kho hôm nay") bằng cách cộng mọi giao dịch từ đầu → chậm và dễ lệch. Xây periodic snapshot.
- Periodic snapshot thiếu kỳ (ngày không có dữ liệu thì không có dòng) → biểu đồ có lỗ. Sinh dòng cho mọi kỳ từ date dimension, kể cả khi giá trị bằng 0 hoặc không đổi.
- Accumulating snapshot bị insert thêm dòng mới mỗi khi qua mốc thay vì update → grain vỡ.
