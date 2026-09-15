---
title: Lakehouse & table format
tagline: Iceberg, Delta, Hudi — ACID trên data lake
tools:
  - Iceberg
  - Delta Lake
  - Hudi
  - Time travel
  - Schema evolution
  - Compaction
  - Trino
bigtech: >-
  Big tech (Netflix, Apple, LinkedIn) là nơi sinh ra Iceberg. Công ty thường: chỉ cần khi có lake
  lớn và nhiều engine đọc chung; nếu chỉ dùng BigQuery thì chưa cần.
---

Table format thêm một lớp metadata lên file Parquet để có: transaction ACID, time travel, schema evolution, upsert/delete, compaction.

- Apache Iceberg: chuẩn mở đang được hầu hết engine hỗ trợ (Spark, Trino, Snowflake, BigQuery).
- Delta Lake: của Databricks, mạnh nhất trong hệ Databricks.
- Hudi: mạnh về upsert streaming, phổ biến hơn ở châu Á.
