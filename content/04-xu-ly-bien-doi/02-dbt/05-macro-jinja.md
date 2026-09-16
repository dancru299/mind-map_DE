---
title: Macro & Jinja
tagline: Sinh SQL bằng code — mạnh, và dễ thành khó đọc
tools:
  - "{% macro %}"
  - "{{ ref() }} / {{ source() }}"
  - run_query
  - dbt_utils
  - target.name
weight: 4
---

dbt biên dịch file `.sql` qua Jinja trước khi gửi tới warehouse: `{{ ref('x') }}` thành tên bảng thật, vòng lặp sinh cột, điều kiện theo môi trường. Macro là hàm Jinja dùng lại được.

```sql
-- macros/cents_to_dollars.sql
{% macro cents_to_dollars(column_name, precision=2) %}
    ROUND({{ column_name }} / 100, {{ precision }})
{% endmacro %}

-- trong model
SELECT order_id, {{ cents_to_dollars('amount_cents') }} AS amount FROM {{ ref('stg_payments') }}
```

Vòng lặp sinh pivot mà không phải gõ tay 12 cột:

```sql
{% set methods = ['card', 'bank_transfer', 'cod', 'wallet'] %}
SELECT order_id,
  {% for m in methods %}
  SUM(CASE WHEN payment_method = '{{ m }}' THEN amount END) AS {{ m }}_amount{{ ',' if not loop.last }}
  {% endfor %}
FROM {{ ref('stg_payments') }} GROUP BY 1
```

Theo môi trường: `{% if target.name == 'dev' %} LIMIT 1000 {% endif %}` — dev chạy trên mẫu, prod chạy đủ.

Trước khi tự viết macro, xem `dbt_utils` (`star`, `pivot`, `date_spine`, `union_relations`, `generate_surrogate_key`) và `dbt_expectations` — hầu hết đã có.

## Sai lầm hay gặp

- Jinja lồng 3 tầng để "linh hoạt" → không ai đọc được SQL sinh ra. Xem `target/compiled/` để thấy SQL thật; nếu bạn không hiểu SQL đó, đơn giản hoá macro.
- `run_query` trong macro chạy lúc parse → gọi warehouse mỗi lần `dbt compile`, chậm và tốn. Chỉ dùng trong `execute` guard.
- Copy macro từ internet cho engine khác (Snowflake vs BigQuery khác cú pháp) mà không đọc.
