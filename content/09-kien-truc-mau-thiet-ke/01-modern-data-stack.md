---
title: Modern Data Stack
tagline: "Managed + ELT + dbt + BI: tổ hợp mặc định của công ty thường"
tools:
  - Fivetran
  - Snowflake
  - dbt
  - Airflow
  - Looker
  - SaaS sprawl
weight: 4
---

Fivetran/Airbyte (ingest) → BigQuery/Snowflake (store) → dbt (transform) → Airflow/Dagster (orchestrate) → Looker/Metabase (BI) → Hightouch (reverse ETL). Gần như toàn bộ là managed, một team 2–3 DE vận hành được.

Điểm yếu: chi phí SaaS cộng dồn, vendor lock-in, và mỗi mảnh là một hoá đơn.
