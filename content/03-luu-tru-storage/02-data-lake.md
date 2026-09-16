---
title: Data Lake
tagline: Object storage + file Parquet, rẻ và linh hoạt
tools:
  - S3
  - GCS
  - ADLS
  - Hive partitioning
  - Hive Metastore
  - Glue Catalog
weight: 4
---

S3 / GCS / ADLS chứa file thô ở mọi định dạng. Rẻ, không giới hạn, nhưng không có ACID, không có index, dễ thành 'data swamp' nếu không có catalog và quy ước thư mục.

Mẫu thư mục điển hình: bucket/layer/source/table/dt=2024-01-01/*.parquet
