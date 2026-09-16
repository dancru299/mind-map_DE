---
title: Window function
tagline: Tính toán "nhìn sang các dòng khác" mà không gom nhóm
tools:
  - ROW_NUMBER
  - RANK / DENSE_RANK
  - LAG / LEAD
  - SUM() OVER
  - ROWS BETWEEN
  - QUALIFY
weight: 5
---

`GROUP BY` gộp nhiều dòng thành một. Window function thì **giữ nguyên từng dòng** nhưng cho phép mỗi dòng nhìn sang các dòng khác trong cùng "cửa sổ": xếp hạng, so với kỳ trước, cộng dồn, trung bình trượt.

Ba phần của một window: `PARTITION BY` (chia nhóm), `ORDER BY` (thứ tự trong nhóm), và *frame* (phạm vi dòng được tính).

```sql
SELECT
  customer_id, order_date, amount,
  ROW_NUMBER()  OVER (PARTITION BY customer_id ORDER BY order_date)            AS order_seq,
  LAG(amount)   OVER (PARTITION BY customer_id ORDER BY order_date)            AS prev_amount,
  SUM(amount)   OVER (PARTITION BY customer_id ORDER BY order_date
                      ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)        AS running_total,
  AVG(amount)   OVER (PARTITION BY customer_id ORDER BY order_date
                      ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)                AS avg_7_orders
FROM orders;
```

## Xếp hạng: ba hàm, ba hành vi khi bằng điểm

| Điểm | ROW_NUMBER | RANK | DENSE_RANK |
|---|---|---|---|
| 100 | 1 | 1 | 1 |
| 90 | 2 | 2 | 2 |
| 90 | 3 | 2 | 2 |
| 80 | 4 | 4 | 3 |

`ROW_NUMBER` luôn duy nhất (dùng để khử trùng), `RANK` nhảy số, `DENSE_RANK` không nhảy.

## ROWS vs RANGE

`ROWS BETWEEN` đếm theo **dòng vật lý**; `RANGE BETWEEN` đếm theo **giá trị** của cột `ORDER BY`. Khi có `ORDER BY` mà không khai báo frame, mặc định là `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW` — các dòng bằng giá trị được gộp chung, nên running total có thể "nhảy" theo cụm thay vì từng dòng.

## Sai lầm hay gặp

- Không khai báo frame rồi ngạc nhiên vì running total của các dòng cùng ngày giống hệt nhau (do mặc định là `RANGE`). Ghi rõ `ROWS BETWEEN ...` khi cần cộng dồn từng dòng.
- Dùng window function trong `WHERE` — không được phép. Bọc trong CTE/subquery, hoặc dùng `QUALIFY` (BigQuery, Snowflake, DuckDB).
- `ORDER BY` không xác định (nhiều dòng cùng giá trị) → `ROW_NUMBER` trả kết quả khác nhau giữa các lần chạy. Thêm cột phụ (id) để thứ tự ổn định.
- Window trên bảng rất lớn không có `PARTITION BY` → toàn bộ dữ liệu phải đi qua một máy để sắp xếp. Luôn hỏi: có thể partition theo gì?
