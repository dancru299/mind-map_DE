---
title: Lộ trình cho Dev chuyển sang DE
tagline: Tận dụng cái đã có, bù cái còn thiếu
tools:
  - SQL
  - Modeling
  - dbt
  - Airflow
  - BigQuery
  - Portfolio project
weight: 4
---

Đã có: lập trình, Git, test, CI/CD, Linux, tư duy hệ thống — đây là thứ nhiều team data thiếu.

Cần bù, theo thứ tự:

- SQL nâng cao (window, CTE, plan) và data modeling (Kimball, grain, SCD).
- Một warehouse (BigQuery hoặc Snowflake) tới mức hiểu chi phí.
- dbt + Airflow/Dagster: dựng một pipeline end-to-end có test và backfill.
- Khái niệm hệ phân tán đủ để đọc lỗi Spark; Kafka cơ bản.
- Thói quen mới: luôn hỏi 'số này sai thì ai phát hiện, bằng cách nào?'
