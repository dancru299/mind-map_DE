---
title: Test trong dbt
tagline: Bốn test có sẵn, test tuỳ chỉnh, và đặt test ở đâu cho đúng
tools:
  - not_null / unique
  - accepted_values
  - relationships
  - dbt_utils
  - dbt_expectations
  - "severity: warn"
---

dbt test = một `SELECT` trả về **các dòng vi phạm**; 0 dòng là pass. Khai báo trong YAML cạnh model:

```yaml
models:
  - name: fct_orders
    description: "Một dòng = một đơn hàng. Grain: order_id."
    columns:
      - name: order_id
        tests: [not_null, unique]
      - name: customer_id
        tests:
          - not_null
          - relationships: {to: ref('dim_customers'), field: customer_id}
      - name: payment_status
        tests:
          - accepted_values: {values: ['paid', 'pending', 'refunded', 'voided']}
      - name: order_total
        tests:
          - dbt_utils.accepted_range: {min_value: 0, inclusive: true}
    tests:
      - dbt_utils.recency: {datepart: day, field: ordered_at, interval: 1}   # dữ liệu phải tươi trong 1 ngày
```

Test tuỳ chỉnh (singular) là một file SQL trong `tests/`:

```sql
-- tests/assert_revenue_matches_source.sql: tổng doanh thu mart phải khớp nguồn ±1%
WITH mart AS (SELECT SUM(order_total) AS t FROM {{ ref('fct_orders') }}),
     src  AS (SELECT SUM(total_price) AS t FROM {{ source('shopify', 'orders') }})
SELECT * FROM mart, src WHERE ABS(mart.t - src.t) / src.t > 0.01
```

## Đặt test ở đâu

- **Staging**: `not_null` + `unique` trên khoá nguồn — bắt nguồn gửi trùng ngay cửa.
- **Marts**: unique trên grain, `relationships` tới dimension, `accepted_values` cho cột phân loại, đối chiếu tổng với nguồn.
- **Freshness** trên `sources` (`dbt source freshness`) — biết nguồn ngừng cập nhật trước khi mart sai.

Dùng `severity: warn` cho test "nên đúng" (tỷ lệ null dưới 5%) và `error` cho test "phải đúng" (khoá duy nhất). `dbt build` chạy model rồi test ngay, model sau không chạy nếu test trước fail.

## Sai lầm hay gặp

- Chỉ test `not_null`/`unique`, không test nghiệp vụ (doanh thu âm, ngày giao trước ngày đặt).
- Test fail được coi là "bình thường" và bị bỏ qua hàng tháng → mất tác dụng. Fail phải chặn hoặc có người xử lý.
- Test `relationships` trên bảng tỷ dòng mỗi lần chạy → tốn; giới hạn bằng `where: "ordered_at >= current_date - 7"`.
