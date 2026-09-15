---
title: Xử lý & biến đổi
tagline: Từ dữ liệu thô thành bảng dùng được
tools:
  - ETL
  - ELT
  - dbt
  - Spark
  - Flink
  - Medallion
bigtech: >-
  Big tech: Spark/Flink hoặc engine nội bộ ở quy mô petabyte, tối ưu hiệu năng là công việc chính.
  Công ty thường: dbt + SQL giải quyết 90%, Spark thường là over-engineering.
---

Nơi tốn nhiều thời gian nhất của DE. Hai câu hỏi lớn: biến đổi bằng SQL trên warehouse (ELT, dbt) hay bằng engine riêng (Spark, Flink)? Batch hay streaming?

Xu hướng: ELT + dbt cho phần lớn công việc; Spark khi dữ liệu quá lớn hoặc logic không diễn đạt được bằng SQL; streaming khi thật sự cần latency giây.
