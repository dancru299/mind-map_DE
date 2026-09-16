---
title: Định dạng file & lưu trữ cột
tagline: "Parquet vs CSV: khác nhau 10 lần chi phí"
tools:
  - Parquet
  - ORC
  - Avro
  - JSON Lines
  - Compression (snappy, zstd)
weight: 4
---

- Row-based (CSV, JSON, Avro): đọc nguyên dòng, tốt cho ghi và streaming.
- Columnar (Parquet, ORC): đọc từng cột, nén tốt, tốt cho analytics — chuẩn mặc định của data lake.
- Avro: có schema đi kèm, phổ biến trên Kafka.

Chuyển CSV sang Parquet + partition theo ngày là cách giảm chi phí query rẻ nhất trên mọi lake.
