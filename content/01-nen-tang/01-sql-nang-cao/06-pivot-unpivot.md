---
title: Pivot & unpivot
tagline: Xoay dòng thành cột cho báo cáo, và ngược lại cho lưu trữ
tools:
  - PIVOT / UNPIVOT
  - CASE WHEN + SUM
  - UNION ALL
weight: 3
---

Báo cáo muốn mỗi tháng một cột; warehouse muốn mỗi tháng một dòng (để partition, để thêm tháng mới không phải đổi schema). DE xoay giữa hai dạng này thường xuyên.

```sql
-- Pivot "tay" — chạy ở mọi engine
SELECT customer_id,
       SUM(CASE WHEN month = '2025-01' THEN amount END) AS m_2025_01,
       SUM(CASE WHEN month = '2025-02' THEN amount END) AS m_2025_02
FROM monthly_sales
GROUP BY customer_id;

-- BigQuery / Snowflake có cú pháp riêng
SELECT * FROM monthly_sales
PIVOT (SUM(amount) FOR month IN ('2025-01', '2025-02'));

-- Unpivot: cột → dòng
SELECT customer_id, month, amount
FROM wide_sales
UNPIVOT (amount FOR month IN (m_2025_01 AS '2025-01', m_2025_02 AS '2025-02'));
```

Nguyên tắc: **lưu dạng dài (long), pivot ở tầng trình bày** (BI tool pivot rất giỏi). Bảng rộng trong warehouse là dấu hiệu modeling sai — trừ khi đó là OBT có chủ đích.

## Sai lầm hay gặp

- Pivot với danh sách cột động (mỗi tháng thêm một cột) → phải sửa SQL mỗi tháng. Nếu buộc phải làm, sinh SQL bằng Jinja (dbt macro) từ danh sách giá trị.
- `SUM(CASE WHEN ...)` không có `ELSE` → cột toàn NULL khi không khớp; thường đúng ý (NULL ≠ 0), nhưng phải biết để `COALESCE` ở BI.
