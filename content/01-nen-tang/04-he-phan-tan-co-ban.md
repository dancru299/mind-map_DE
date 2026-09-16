---
title: Hệ phân tán cơ bản
tagline: Vì sao chạy trên 1 máy khác 100 máy
tools:
  - Partition
  - Shuffle
  - Skew
  - Exactly-once
  - Idempotency
  - CAP
bigtech: >-
  Đây là phần big tech đào rất sâu (design a metrics pipeline cho 1 tỷ user). Công ty thường: chủ
  yếu cần hiểu để không viết job Spark 3 tiếng vì skew.
weight: 5
---

Không cần thành chuyên gia, nhưng phải hiểu các khái niệm này để đọc lỗi Spark hay thiết kế pipeline không bị sai dữ liệu.

- Partitioning: chia dữ liệu theo khoá để xử lý song song; chọn khoá sai gây skew (một máy làm hết việc).
- Shuffle: đưa dữ liệu cùng khoá về cùng máy (cho join/groupBy) — thao tác đắt nhất.
- Delivery semantics: at-most-once / at-least-once / exactly-once.
- Idempotency: chạy lại 10 lần vẫn ra kết quả như chạy 1 lần. Là yêu cầu bắt buộc của mọi pipeline.
