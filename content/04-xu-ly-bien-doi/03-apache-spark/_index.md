---
title: Apache Spark
tagline: Engine xử lý phân tán cho dữ liệu lớn hơn một máy
tools:
  - PySpark
  - DataFrame
  - Lazy evaluation
  - Shuffle
  - Skew
  - Broadcast join
  - Catalyst
  - Databricks
  - EMR
  - Dataproc
bigtech: >-
  Big tech: tune Spark ở mức sâu (memory, AQE, custom partitioner) là công việc hằng ngày. Công ty
  thường: dùng khi warehouse SQL không đủ; nhiều chỗ dùng Spark chỉ vì 'nghe hay'.
---

Spark chia dữ liệu thành partition, xử lý song song trên nhiều executor, lazy evaluation (chỉ chạy khi có action). Dùng qua PySpark, Scala hoặc Spark SQL.

Vấn đề thực tế bạn sẽ gặp: shuffle quá nhiều, data skew, OOM executor, quá nhiều file nhỏ, chọn số partition sai.

Managed: Databricks, EMR, Dataproc, Glue, Fabric.
