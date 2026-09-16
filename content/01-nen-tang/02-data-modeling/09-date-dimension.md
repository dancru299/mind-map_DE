---
title: Date dimension
tagline: Bảng ngày — dimension đầu tiên nên có trong mọi warehouse
tools:
  - dim_date
  - Fiscal calendar
  - Holiday flag
  - dbt_date / dbt_utils.date_spine
weight: 4
---

Một bảng với **một dòng mỗi ngày** trong vài chục năm, kèm mọi thuộc tính người ta hay hỏi: thứ, tuần, tháng, quý, năm, năm tài chính, ngày lễ, ngày làm việc, ngày đầu/cuối tháng. Join fact với `dim_date` thay vì gọi hàm ngày trong mỗi query.

Lý do: **định nghĩa thống nhất** (tuần bắt đầu thứ Hai hay Chủ nhật? quý tài chính bắt đầu tháng nào?) nằm ở một chỗ; ngày lễ Việt Nam không có hàm SQL nào biết; và sinh dòng cho ngày không có dữ liệu (biểu đồ không bị lỗ).

```sql
-- BigQuery: sinh khung ngày
CREATE OR REPLACE TABLE dim_date AS
SELECT
  d                                     AS date_key,
  EXTRACT(YEAR FROM d)                  AS year,
  EXTRACT(QUARTER FROM d)               AS quarter,
  EXTRACT(MONTH FROM d)                 AS month,
  FORMAT_DATE('%Y-%m', d)               AS year_month,
  EXTRACT(ISOWEEK FROM d)               AS iso_week,
  EXTRACT(DAYOFWEEK FROM d)             AS day_of_week,      -- 1 = Chủ nhật
  EXTRACT(DAYOFWEEK FROM d) IN (1, 7)   AS is_weekend,
  d = LAST_DAY(d)                       AS is_month_end,
  CASE WHEN EXTRACT(MONTH FROM d) >= 4 THEN EXTRACT(YEAR FROM d) ELSE EXTRACT(YEAR FROM d) - 1 END AS fiscal_year  -- FY bắt đầu tháng 4
FROM UNNEST(GENERATE_DATE_ARRAY('2015-01-01', '2035-12-31')) AS d;
-- Ngày lễ: LEFT JOIN với bảng seed holidays.csv (dbt seed), vì lịch âm không tính bằng công thức
```

## Sai lầm hay gặp

- Khoá ngày kiểu `INT` dạng `20250601` ("chuẩn Kimball cũ") trên warehouse hiện đại → mất partition pruning theo ngày, phải cast qua lại. Dùng kiểu `DATE`.
- Không có dòng cho ngày "chưa tới" → pipeline chạy đầu năm mới gãy. Sinh dư 10 năm.
- Múi giờ: fact lưu UTC, `dim_date` theo giờ Việt Nam → 7 giờ sai lệch mỗi ngày. Chuyển múi giờ **trước** khi lấy `DATE()`.
