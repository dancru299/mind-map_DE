---
title: Điều phối (Orchestration)
tagline: Ai chạy gì, lúc nào, sau cái gì, và làm gì khi hỏng
tools:
  - DAG
  - Airflow
  - Dagster
  - Backfill
  - Idempotency
  - SLA
bigtech: >-
  Big tech: orchestrator nội bộ (Dataswarm ở Meta, Borg-based ở Google), có sẵn SLA và on-call. Công
  ty thường: Airflow gần như mặc định; nhiều nơi vẫn chạy cron + script.
---

Orchestrator quản lý DAG (đồ thị phụ thuộc giữa các task), lịch chạy, retry, cảnh báo, và backfill. Nó là 'trung tâm điều khiển' mà mọi pipeline đi qua.

Câu hỏi thiết kế quan trọng nhất không phải chọn tool, mà là: task này chạy lại có an toàn không (idempotent)? Chạy cho ngày hôm qua thì ra đúng dữ liệu hôm qua không?
