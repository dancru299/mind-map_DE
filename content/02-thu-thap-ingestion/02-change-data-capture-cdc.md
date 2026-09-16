---
title: Change Data Capture (CDC)
tagline: Đọc log giao dịch của DB để bắt mọi INSERT/UPDATE/DELETE
tools:
  - Debezium
  - binlog
  - WAL
  - Kafka Connect
  - Datastream
  - Fivetran
bigtech: >-
  Công ty thường hay gặp: DBA không cho bật binlog/replication vì lo ảnh hưởng production. Big tech:
  CDC là hạ tầng có sẵn.
weight: 5
---

Thay vì query bảng nguồn, CDC đọc transaction log (binlog MySQL, WAL Postgres). Bắt được cả DELETE, gần thời gian thực, không tăng tải cho DB nguồn.

Debezium là chuẩn mở phổ biến nhất, thường đẩy vào Kafka rồi ghi xuống lake/warehouse.

- Log-based CDC: chính xác, ít tải, nhưng cần quyền replication và setup phức tạp.
- Query-based CDC: poll theo updated_at, dễ làm nhưng bỏ sót delete.
