---
title: Join nâng cao & các bẫy
tagline: Semi/anti join, fan-out, và cái bẫy NULL trong NOT IN
tools:
  - EXISTS / NOT EXISTS
  - LEFT JOIN ... IS NULL
  - NOT IN (bẫy NULL)
  - Fan-out
  - Cross join
weight: 5
---

Phần lớn số liệu sai trong warehouse là do join sai grain: join bảng đơn hàng (1 dòng/đơn) với bảng dòng hàng (nhiều dòng/đơn) rồi `SUM(order_total)` → tổng bị nhân lên theo số dòng hàng. Đây gọi là **fan-out**.

```sql
-- Kiểm tra fan-out trước khi tin bất kỳ tổng nào
SELECT COUNT(*) AS rows_before FROM orders;
SELECT COUNT(*) AS rows_after  FROM orders o LEFT JOIN order_items i USING (order_id);
-- rows_after > rows_before → join đã nhân dòng; tổng hợp order_items về grain đơn hàng trước khi join
```

## Semi join và anti join

"Khách hàng **có** ít nhất một đơn" / "khách hàng **chưa** có đơn nào" — dùng `EXISTS`, không join rồi `DISTINCT`:

```sql
SELECT c.* FROM customers c
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id);      -- semi join

SELECT c.* FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id);  -- anti join
```

## Bẫy NULL trong NOT IN

```sql
SELECT * FROM customers
WHERE customer_id NOT IN (SELECT customer_id FROM orders);   -- nếu orders có 1 dòng customer_id NULL → trả về 0 dòng
```

`x NOT IN (1, 2, NULL)` = `x <> 1 AND x <> 2 AND x <> NULL` = `UNKNOWN` với mọi x. Dùng `NOT EXISTS` hoặc lọc `IS NOT NULL` trong subquery.

## Sai lầm hay gặp

- Join theo cột kiểu khác nhau (`STRING` với `INT64`) → engine ép kiểu ngầm, mất index/partition pruning, hoặc join lệch.
- `LEFT JOIN` rồi đặt điều kiện của bảng phải trong `WHERE` (`WHERE b.status = 'active'`) → biến thành `INNER JOIN` âm thầm. Đưa điều kiện vào `ON`.
- Cross join vô tình do thiếu điều kiện `ON` (hoặc `USING` sai tên cột) — trên bảng triệu dòng là hàng nghìn tỷ dòng.
- Join nhiều bảng lớn không có filter partition trước → shuffle khổng lồ. Lọc và gom trước, join sau.
