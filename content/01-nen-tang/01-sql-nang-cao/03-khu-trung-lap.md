---
title: Khử trùng lặp (dedup)
tagline: Giữ đúng một bản ghi cho mỗi khoá — và quyết định bản nào
tools:
  - ROW_NUMBER
  - QUALIFY
  - DISTINCT
  - ARRAY_AGG ... LIMIT 1
---

Dữ liệu trùng đến từ khắp nơi: CDC gửi cùng một sự kiện hai lần, pipeline chạy lại mà không idempotent, nguồn có nhiều dòng cho một khoá theo thời gian. Câu hỏi thật sự không phải "bỏ trùng thế nào" mà là **"giữ bản nào"** — thường là bản mới nhất theo `updated_at`.

```sql
-- Chuẩn: ROW_NUMBER theo khoá, giữ dòng mới nhất
SELECT * EXCEPT (rn)
FROM (
  SELECT *,
         ROW_NUMBER() OVER (PARTITION BY order_id ORDER BY updated_at DESC, ingested_at DESC) AS rn
  FROM raw_orders
)
WHERE rn = 1;

-- BigQuery / Snowflake / DuckDB: gọn hơn với QUALIFY
SELECT *
FROM raw_orders
QUALIFY ROW_NUMBER() OVER (PARTITION BY order_id ORDER BY updated_at DESC) = 1;
```

`SELECT DISTINCT` chỉ đúng khi **toàn bộ dòng** giống hệt nhau. Nếu chỉ khoá trùng còn giá trị khác, `DISTINCT` giữ cả hai — không phải dedup.

## Sai lầm hay gặp

- `ORDER BY updated_at DESC` mà nhiều dòng cùng `updated_at` → kết quả không xác định, mỗi lần chạy giữ một bản khác. Thêm tie-breaker (`ingested_at`, `_file_name`, id tăng dần).
- Dedup ở tầng cuối (mart) thay vì ngay sau raw → mọi bảng trung gian đều mang trùng lặp, join phình lên.
- Dedup bằng `GROUP BY key` + `MAX(col)` cho từng cột → trộn giá trị của hai bản ghi khác nhau thành một dòng chưa từng tồn tại.
- Quên hỏi vì sao trùng. Nếu nguồn gửi trùng do bug upstream, dedup ở dưới chỉ che triệu chứng.
