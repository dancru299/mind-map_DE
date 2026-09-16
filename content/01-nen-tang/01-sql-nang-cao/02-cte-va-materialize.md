---
title: CTE và chuyện materialize
tagline: WITH không có nghĩa là "tính một lần"
tools:
  - WITH ... AS
  - MATERIALIZED / NOT MATERIALIZED
  - CREATE TEMP TABLE
  - EXPLAIN
bigtech: >-
  Ở đâu cũng vậy: CTE là công cụ đọc code, không phải công cụ tối ưu. Khác nhau chỉ ở chỗ engine nội bộ
  của big tech thường có tài liệu rõ về hành vi; với BigQuery/Snowflake bạn phải tự đọc plan.
weight: 4
---

CTE (`WITH tmp AS (...)`) chỉ là **đặt tên cho một subquery**. Nó giúp code dễ đọc, nhưng không có gì đảm bảo engine sẽ tính khối đó một lần rồi dùng lại. Hai cách engine có thể thực thi:

- **Inline**: thay tên CTE bằng chính subquery ở mỗi chỗ tham chiếu, rồi tối ưu cả query. Tham chiếu 3 lần = có thể tính 3 lần.
- **Materialize**: tính một lần, giữ kết quả tạm, dùng lại. Chỉ xảy ra khi engine chọn hoặc bạn ép.

```sql
WITH big AS (
  SELECT user_id, SUM(amount) AS total
  FROM transactions            -- 2 tỷ dòng
  GROUP BY user_id
)
SELECT * FROM big WHERE total > 1000
UNION ALL
SELECT * FROM big WHERE total < 0;   -- trên BigQuery: quét 2 tỷ dòng lần thứ hai
```

## Hành vi theo engine

| Engine | Mặc định | Ghi chú |
|---|---|---|
| BigQuery | Inline | Dùng lại nhiều lần → `CREATE TEMP TABLE` hoặc tách model dbt |
| Postgres ≥ 12 | Inline nếu tham chiếu 1 lần, materialize nếu ≥ 2 | Ép bằng `AS MATERIALIZED` / `AS NOT MATERIALIZED`. Postgres < 12 luôn materialize (optimization fence) |
| Snowflake | Optimizer tự quyết | Thường inline |
| Spark SQL | Inline | Dùng `df.cache()` hoặc ghi ra bảng |
| SQL Server | Inline | Dùng `#temp` table khi cần dùng lại |

## Rút ra

1. Khối nặng được tham chiếu nhiều lần → ghi ra bảng tạm / bảng thật / model dbt riêng.
2. Muốn biết chắc → đọc `EXPLAIN`. Cùng một scan xuất hiện hai lần trong plan nghĩa là CTE đã bị inline.
3. Chiều ngược lại cũng đúng: ở Postgres cũ, CTE luôn materialize nên *chặn* optimizer đẩy `WHERE` xuống dưới — query chậm hơn viết subquery thường.

## Sai lầm hay gặp

- Gom logic nặng vào một CTE rồi `UNION` nó 4 lần để tính 4 chỉ số, tưởng "tính một lần". Trên BigQuery hoá đơn tăng 4 lần.
- Dùng CTE đệ quy (`WITH RECURSIVE`) cho cây sâu trên warehouse cột — cực chậm; xử lý bằng Python hoặc lặp có giới hạn.
