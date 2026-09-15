---
title: dbt
tagline: SQL + Jinja + test + docs — chuẩn de facto cho lớp biến đổi
tools:
  - dbt Core
  - dbt Cloud
  - ref()
  - Incremental model
  - dbt test
  - Snapshot
  - Macro
  - Exposure
bigtech: >-
  dbt phổ biến áp đảo ở công ty thường và startup. Big tech thường có công cụ nội bộ tương đương,
  dbt ít gặp hơn.
---

dbt biến SQL thành phần mềm: model là file SELECT, dbt tự tính thứ tự chạy theo ref(), có test, có docs, có lineage, có CI.

- Model & ref(): DAG tự sinh từ quan hệ giữa các SELECT.
- Materialization: view / table / incremental / ephemeral — chọn theo kích thước và tần suất.
- Test: not_null, unique, relationships, accepted_values + test tuỳ chỉnh.
- Snapshot: SCD Type 2 sẵn có. Seed: CSV nhỏ. Macro: Jinja tái sử dụng.
- Layering: staging → intermediate → marts.
