---
title: Chọn grain
tagline: '"Một dòng trong bảng này là gì?" — câu hỏi đầu tiên và quan trọng nhất'
tools:
  - Grain
  - Atomic grain
  - Aggregate table
---

Grain là định nghĩa **một dòng đại diện cho cái gì**: một đơn hàng? một dòng hàng trong đơn? một đơn hàng mỗi ngày (snapshot)? Mọi quyết định khác — cột nào được phép có, join với gì, `SUM` cái gì có nghĩa — đều đi ra từ grain.

Quy tắc Kimball: **bắt đầu ở grain nguyên tử (atomic)** — mức chi tiết nhất nguồn có. Bảng tổng hợp (theo ngày, theo tháng) sinh ra từ bảng nguyên tử, không thay thế nó, vì tổng hợp rồi thì không đi ngược lại được.

```sql
-- Grain: một dòng = một dòng hàng trong một đơn (order_id, line_no)
CREATE TABLE fct_order_line AS
SELECT
  o.order_id, l.line_no,                -- khoá tự nhiên xác định grain
  o.order_date_key, o.customer_key, l.product_key,
  l.quantity, l.unit_price, l.quantity * l.unit_price AS line_amount
FROM stg_order_lines l JOIN stg_orders o USING (order_id);

-- Kiểm tra grain: khoá phải duy nhất
SELECT order_id, line_no, COUNT(*) FROM fct_order_line GROUP BY 1, 2 HAVING COUNT(*) > 1;
```

## Dấu hiệu grain đang sai

- Có cột "không thuộc về" dòng: bảng dòng hàng mà có `order_total` (tổng cả đơn) → `SUM(order_total)` sai ngay.
- Phải `DISTINCT` để đếm → bảng có nhiều dòng cho một thực thể mà bạn tưởng là một.
- Analyst hỏi "bảng này 1 dòng là gì?" mà phải suy nghĩ.

## Sai lầm hay gặp

- Chọn grain theo báo cáo đang cần ("theo tháng là đủ") → 3 tháng sau cần theo ngày, phải làm lại từ raw.
- Trộn hai grain trong một bảng (dòng đơn hàng và dòng hoàn tiền) rồi phân biệt bằng cột `type` → mỗi query phải nhớ lọc.
- Không ghi grain vào docs/description của bảng. Ghi một câu: "Một dòng = một …".
