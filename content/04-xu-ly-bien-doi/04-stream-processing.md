---
title: Stream processing
tagline: Flink, Kafka Streams — xử lý sự kiện ngay khi đến
tools:
  - Apache Flink
  - Kafka Streams
  - Event time
  - Window (tumbling, sliding, session)
  - Watermark
  - State
  - Checkpoint
  - Exactly-once
bigtech: >-
  Big tech: streaming là mặc định cho ads, fraud, recommendation. Công ty thường: chỉ cần khi có bài
  toán latency giây thật sự — hỏi kỹ trước khi dựng vì chi phí vận hành cao.
weight: 4
---

Khác batch ở chỗ dữ liệu không có 'kết thúc'. Phải nghĩ về thời gian: event time vs processing time, window, watermark (đợi dữ liệu trễ bao lâu), state (nhớ gì giữa các event), và exactly-once.

Flink là engine mạnh nhất về stateful streaming; Kafka Streams nhẹ hơn, nhúng trong app Java.
