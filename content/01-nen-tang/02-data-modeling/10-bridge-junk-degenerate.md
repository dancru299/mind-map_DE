---
title: Bridge, junk & degenerate dimension
tagline: Ba mẫu xử lý những thứ không vừa với star schema đơn giản
tools:
  - Bridge table
  - Junk dimension
  - Degenerate dimension
  - Many-to-many
---

## Bridge table — quan hệ nhiều-nhiều

Một đơn hàng có nhiều mã giảm giá, một bệnh nhân có nhiều chẩn đoán, một tài khoản có nhiều chủ. Fact không thể trỏ tới "nhiều" dimension bằng một khoá. Bridge là bảng trung gian `(fact_key, dim_key, weight)`; cột `weight` (tổng = 1 cho mỗi fact) để tránh nhân đôi số đo khi join.

```sql
-- Doanh thu theo mã giảm giá, không bị nhân đôi khi đơn có 2 mã
SELECT p.promo_name, SUM(f.amount * b.weight) AS attributed_revenue
FROM fct_order f
JOIN bridge_order_promo b USING (order_key)
JOIN dim_promo p USING (promo_key)
GROUP BY 1;
```

## Junk dimension — gom cờ lặt vặt

Fact có 6 cột kiểu `is_gift`, `payment_method`, `channel`, `is_first_order`… Mỗi cột làm một dimension riêng thì quá nhiều; để thẳng trong fact thì fact phình. Gom tất cả tổ hợp giá trị vào một dimension nhỏ (`dim_order_flags`) và fact chỉ giữ một khoá.

## Degenerate dimension — khoá không có bảng

`order_number`, `invoice_number`, `tracking_code`: là thuộc tính dimension nhưng không có thuộc tính nào khác đi kèm → không cần bảng riêng, để thẳng trong fact. Vẫn gọi là "dimension" để phân biệt với số đo.

## Sai lầm hay gặp

- Nhiều-nhiều giải bằng cách nhân dòng fact (một đơn 2 mã giảm giá → 2 dòng fact) → `SUM(amount)` sai gấp đôi. Đây là lỗi phổ biến nhất khi không có bridge.
- Junk dimension sinh tổ hợp bằng cross join mọi giá trị có thể → hàng triệu dòng vô nghĩa. Chỉ sinh tổ hợp thực sự xuất hiện.
- Nhầm degenerate dimension với số đo rồi `SUM(order_number)`.
