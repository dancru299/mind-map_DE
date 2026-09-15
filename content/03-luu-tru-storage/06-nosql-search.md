---
title: NoSQL & search
tagline: Khi bảng quan hệ không phải câu trả lời
tools:
  - MongoDB
  - DynamoDB
  - Cassandra
  - Bigtable
  - Elasticsearch
  - Redis
---

- Key-value / document (Redis, DynamoDB, MongoDB): serving layer cho app hoặc nguồn dữ liệu cần flatten.
- Wide-column (Cassandra, HBase, Bigtable): ghi cực nhiều, đọc theo khoá.
- Search (Elasticsearch, OpenSearch): full-text và log analytics.

DE thường gặp chúng ở vai trò nguồn hoặc đích, hơn là nơi lưu trung tâm.
