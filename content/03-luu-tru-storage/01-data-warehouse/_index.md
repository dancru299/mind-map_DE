---
title: Data Warehouse
tagline: BigQuery, Snowflake, Redshift — SQL managed, cột, MPP
tools:
  - BigQuery
  - Snowflake
  - Redshift
  - Synapse
  - MPP
  - Partition
  - Clustering
  - Slot
bigtech: >-
  Công ty thường: một query viết ẩu trên BigQuery có thể tốn vài triệu đồng — DE phải biết cost
  control. Big tech: chi phí được tính ở mức tổ chức, ít áp lực lên cá nhân.
---

Kho dữ liệu có cấu trúc, query bằng SQL, tự động scale. Bạn không quản lý server; bạn quản lý chi phí và mô hình dữ liệu.

- BigQuery: tính tiền theo byte quét (hoặc slot), serverless. Partition + cluster là hai đòn bẩy chi phí.
- Snowflake: tách compute (virtual warehouse) khỏi storage, tính tiền theo giây chạy.
- Redshift: cluster AWS, gần Postgres, cần tune distribution key.
