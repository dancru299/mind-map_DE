---
title: Kiến trúc driver / executor
tagline: Ai lập kế hoạch, ai làm việc, và dữ liệu nằm ở đâu
tools:
  - Driver
  - Executor
  - Cluster manager (YARN / Kubernetes)
  - spark.executor.memory
  - Lazy evaluation
weight: 4
---

Một ứng dụng Spark gồm **một driver** và **nhiều executor**:

- **Driver**: chạy code của bạn (`main`), xây kế hoạch (DAG các stage), chia việc thành task, gửi cho executor, gom kết quả nhỏ về. Driver chết là ứng dụng chết.
- **Executor**: tiến trình JVM trên các máy worker, mỗi executor có vài core và một lượng RAM; chạy task và giữ partition dữ liệu trong bộ nhớ/đĩa.
- **Cluster manager** (YARN, Kubernetes, Standalone, hoặc Databricks/EMR/Dataproc lo hộ): cấp máy cho driver và executor.

```python
from pyspark.sql import SparkSession

spark = (SparkSession.builder
    .appName("daily_orders")
    .config("spark.executor.instances", "8")
    .config("spark.executor.cores", "4")          # 8 × 4 = 32 task chạy song song
    .config("spark.executor.memory", "12g")
    .config("spark.sql.shuffle.partitions", "256") # mặc định 200 — chỉnh theo dữ liệu
    .getOrCreate())

df = spark.read.parquet("gs://raw/orders/dt=2025-06-01/")   # chưa đọc gì — lazy
agg = df.groupBy("customer_id").agg(F.sum("amount").alias("total"))  # vẫn chưa chạy
agg.write.mode("overwrite").parquet("gs://silver/customer_totals/")  # action → lúc này mới chạy
```

**Lazy evaluation**: transformation (`select`, `filter`, `join`, `groupBy`) chỉ ghi vào kế hoạch; **action** (`write`, `count`, `collect`, `show`) mới kích hoạt chạy. Nhờ vậy Spark tối ưu cả chuỗi (đẩy filter xuống trước, gộp bước) trước khi đụng dữ liệu.

## Sai lầm hay gặp

- `collect()` hoặc `toPandas()` bảng lớn → toàn bộ dữ liệu về driver → driver OOM. Chỉ collect kết quả đã gom nhỏ.
- Gọi `count()` "để xem" giữa chừng → chạy toàn bộ kế hoạch tới đó, rồi lại chạy lại khi `write`. Mỗi action là một lần chạy trừ khi `cache()`.
- Executor to (64g, 16 core) → GC lâu, một executor chết mất nhiều dữ liệu. Thường 4–5 core, 8–16g mỗi executor là điểm cân bằng.
- Hiểu nhầm `spark.executor.memory` là toàn bộ RAM dùng được: JVM overhead + memory fraction chỉ để lại ~60% cho dữ liệu.
