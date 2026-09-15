---
title: Lưu trữ (Storage)
tagline: Warehouse, lake, lakehouse — dữ liệu nằm ở đâu và tại sao
tools:
  - Data Warehouse
  - Data Lake
  - Lakehouse
  - OLAP
  - Object storage
bigtech: >-
  Big tech: hệ thống lưu trữ tự xây (Colossus, Tectonic…), DE không chọn mà dùng. Công ty thường:
  phải chọn giữa BigQuery/Snowflake/Databricks/Postgres, và chi phí là yếu tố quyết định.
---

Chọn nơi lưu quyết định chi phí, tốc độ query và những gì bạn làm được sau này. Xu hướng hiện tại: lakehouse (file mở trên object storage + table format có ACID) hoặc warehouse managed.

Phân biệt OLTP (DB ứng dụng, tối ưu ghi từng dòng) và OLAP (phân tích, tối ưu quét nhiều dòng ít cột). Chạy analytics trên DB production là sai lầm kinh điển.
