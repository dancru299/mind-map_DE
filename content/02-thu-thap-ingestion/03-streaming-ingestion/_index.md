---
title: Streaming ingestion
tagline: Kafka và họ hàng — dữ liệu chảy liên tục
tools:
  - Kafka
  - Topic
  - Partition
  - Offset
  - Consumer group
  - Schema Registry
  - Pub/Sub
  - Kinesis
bigtech: >-
  Big tech: Kafka/hệ thống tương đương chạy hàng triệu event/giây, có team vận hành riêng. Công ty
  thường: phần lớn không thật sự cần streaming — batch 15 phút đủ cho 90% bài toán.
---

Event được ghi vào topic, consumer đọc theo offset. Giữ được thứ tự trong partition, replay được, tách producer khỏi consumer.

Khái niệm phải nắm: topic, partition, offset, consumer group, retention, key (quyết định partition, quyết định thứ tự).

Managed thay thế: Kinesis (AWS), Pub/Sub (GCP), Event Hubs (Azure), Confluent Cloud, Redpanda.
