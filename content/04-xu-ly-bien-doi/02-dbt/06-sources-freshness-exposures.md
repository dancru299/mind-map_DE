---
title: Sources, freshness & exposures
tagline: Khai báo hai đầu của pipeline — nguồn vào và người dùng ra
tools:
  - sources.yml
  - dbt source freshness
  - loaded_at_field
  - exposures
  - dbt docs
---

## Sources — đầu vào

Khai báo bảng nguồn trong YAML thay vì gõ tên bảng thẳng vào SQL. Được: đổi tên schema một chỗ, có lineage từ nguồn, và kiểm tra **freshness**.

```yaml
sources:
  - name: shopify
    database: raw
    schema: shopify_prod
    loaded_at_field: _fivetran_synced         # cột cho biết dòng được tải lúc nào
    freshness:
      warn_after:  {count: 6,  period: hour}
      error_after: {count: 24, period: hour}
    tables:
      - name: orders
      - name: customers
        freshness: {error_after: {count: 7, period: day}}   # bảng ít đổi, nới lỏng
```

`dbt source freshness` so `MAX(loaded_at_field)` với hiện tại → biết Fivetran/CDC ngừng từ lúc nào, trước khi ai đó phát hiện dashboard đứng yên.

## Exposures — đầu ra

Khai báo dashboard, model ML, ứng dụng nào đang dùng model nào:

```yaml
exposures:
  - name: revenue_dashboard
    type: dashboard
    owner: {name: Finance BI, email: finance-bi@example.com}
    depends_on: [ref('fct_orders'), ref('dim_customers')]
    url: https://looker.example.com/dashboards/42
```

Lợi ích thực tế: trước khi đổi `fct_orders`, `dbt ls --select +exposure:revenue_dashboard` cho biết ai bị ảnh hưởng; lineage trong `dbt docs` chạy tới tận dashboard.

## Sai lầm hay gặp

- `loaded_at_field` dùng cột nghiệp vụ (`created_at`) thay vì cột tải → nguồn không có đơn mới trong 6 giờ (đêm) bị báo "stale" giả.
- Không ai cập nhật exposures sau khi tạo → lineage sai còn tệ hơn không có. Đưa vào checklist tạo dashboard mới.
