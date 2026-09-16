---
title: Kafka Connect
tagline: Kéo dữ liệu vào/ra Kafka bằng cấu hình thay vì code
tools:
  - Source connector
  - Sink connector
  - Debezium
  - BigQuery / S3 sink
  - SMT (Single Message Transform)
weight: 3
---

Kafka Connect là framework chạy các **connector** — plugin đã viết sẵn để đọc từ hệ thống ngoài vào Kafka (*source*) hoặc từ Kafka ra ngoài (*sink*). Bạn viết JSON cấu hình, không viết consumer/producer.

- **Source** phổ biến: Debezium (CDC từ MySQL/Postgres/MongoDB/SQL Server), JDBC (poll theo cột tăng dần), file, MQTT.
- **Sink** phổ biến: S3/GCS (ghi Parquet theo giờ), BigQuery, Snowflake, Elasticsearch, JDBC.

```json
{
  "name": "orders-to-gcs",
  "config": {
    "connector.class": "io.confluent.connect.gcs.GcsSinkConnector",
    "topics": "orders",
    "gcs.bucket.name": "raw-events",
    "format.class": "io.confluent.connect.gcs.format.parquet.ParquetFormat",
    "flush.size": "50000",
    "rotate.interval.ms": "600000",
    "partitioner.class": "io.confluent.connect.storage.partitioner.TimeBasedPartitioner",
    "path.format": "'dt'=YYYY-MM-dd/'hr'=HH",
    "timestamp.extractor": "RecordField",
    "timestamp.field": "ordered_at",
    "transforms": "unwrap",
    "transforms.unwrap.type": "io.debezium.transforms.ExtractNewRecordState"
  }
}
```

**SMT** biến đổi nhẹ từng message trên đường đi (đổi tên trường, bỏ trường PII, tách envelope Debezium). Logic nặng hơn (join, gom) không thuộc về Connect — dùng Flink/Kafka Streams.

Connect chạy ở chế độ *distributed*: nhiều worker chia task, tự chuyển task khi worker chết, offset của connector lưu trong Kafka.

## Sai lầm hay gặp

- Sink ghi file mỗi vài giây (`flush.size` nhỏ, `rotate.interval.ms` nhỏ) → small files problem trên lake.
- Partition theo **thời gian nhận** (`Wallclock`) thay vì thời gian sự kiện → dữ liệu đến trễ rơi vào thư mục sai ngày.
- Connector lỗi một message (schema không parse được) → dừng cả task. Cấu hình `errors.tolerance=all` + dead letter queue.
- Chạy Connect trên một worker duy nhất "tạm thời" — worker chết là mọi pipeline dừng.
