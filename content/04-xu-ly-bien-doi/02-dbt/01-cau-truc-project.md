---
title: Cấu trúc project dbt
tagline: staging → intermediate → marts, và quy ước đặt tên để 6 tháng sau còn hiểu
tools:
  - models/staging
  - models/intermediate
  - models/marts
  - sources.yml
  - dbt_project.yml
---

Cấu trúc được dbt Labs khuyến nghị và gần như mọi team dùng:

```
models/
├── staging/                 # 1 thư mục mỗi nguồn; 1 model mỗi bảng nguồn; chỉ đổi tên, ép kiểu, không join
│   ├── shopify/
│   │   ├── _shopify__sources.yml
│   │   ├── _shopify__models.yml
│   │   ├── stg_shopify__orders.sql
│   │   └── stg_shopify__customers.sql
│   └── stripe/...
├── intermediate/            # logic nghiệp vụ nhiều bước, join giữa các staging; không cho BI đọc trực tiếp
│   └── finance/int_payments_pivoted_to_orders.sql
└── marts/                   # bảng cuối theo domain: fct_*, dim_*; đây là thứ BI/analyst dùng
    ├── finance/fct_orders.sql
    └── marketing/dim_customers.sql
```

Quy ước tên: `stg_<nguồn>__<bảng>`, `int_<mô tả>`, `fct_<sự kiện>`, `dim_<thực thể>`. Dấu `__` (2 gạch) tách nguồn khỏi tên bảng.

```sql
-- stg_shopify__orders.sql: chỉ làm sạch, đổi tên, ép kiểu — 1:1 với nguồn
WITH source AS (SELECT * FROM {{ source('shopify', 'orders') }})
SELECT
  id                         AS order_id,
  customer_id,
  CAST(created_at AS TIMESTAMP) AS ordered_at,
  total_price                AS order_total,
  LOWER(financial_status)    AS payment_status
FROM source
```

Staging là lớp "đệm": nguồn đổi tên cột thì chỉ sửa một file staging, mọi thứ phía sau không biết gì.

## Sai lầm hay gặp

- Join hoặc lọc nghiệp vụ ngay trong staging → staging không còn 1:1 với nguồn, không tái sử dụng được.
- Marts tham chiếu thẳng `source()` bỏ qua staging → nguồn đổi là gãy nhiều chỗ.
- Một file YAML khổng lồ cho toàn project thay vì YAML cạnh model → không ai cập nhật docs.
- Model tên `orders_v2_final_fixed`.
