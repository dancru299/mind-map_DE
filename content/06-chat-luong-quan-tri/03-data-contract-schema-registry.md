---
title: Data contract & schema registry
tagline: Thoả thuận giữa người sinh dữ liệu và người dùng
tools:
  - Data contract
  - Schema Registry
  - Avro
  - Protobuf
  - Backward compatible
  - Schema evolution
bigtech: >-
  Ở công ty thường, vấn đề lớn nhất là đội ngũ upstream không coi dữ liệu là sản phẩm — contract
  thường là thoả thuận miệng. Big tech áp contract bằng công cụ và quy trình.
---

Team app đổi tên cột → pipeline gãy lúc 3h sáng. Data contract là hợp đồng có kiểm tra tự động: schema, ý nghĩa, SLA, owner của một nguồn dữ liệu.

Schema Registry (cho Kafka/Avro/Protobuf) kiểm tra tương thích khi producer đổi schema, chặn thay đổi phá vỡ consumer.
