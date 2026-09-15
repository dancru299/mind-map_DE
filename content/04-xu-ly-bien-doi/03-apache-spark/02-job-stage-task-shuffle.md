---
title: Job → stage → task, narrow vs wide
tagline: Vì sao một groupBy chia job thành hai stage và chuyển dữ liệu qua mạng
tools:
  - Narrow transformation
  - Wide transformation
  - Shuffle
  - Stage boundary
  - spark.sql.shuffle.partitions
---

Mỗi action tạo một **job**. Job được cắt thành **stage** tại mỗi điểm cần shuffle. Mỗi stage gồm nhiều **task**, một task xử lý một partition.

- **Narrow transformation** (`map`, `filter`, `select`, `withColumn`, `union`): mỗi partition đầu ra chỉ cần **một** partition đầu vào — chạy tại chỗ, không chuyển dữ liệu, gộp chung một stage.
- **Wide transformation** (`groupBy`, `join`, `distinct`, `repartition`, `orderBy`, window có `partitionBy`): partition đầu ra cần dữ liệu từ **nhiều** partition đầu vào — phải **shuffle**: mỗi executor ghi dữ liệu ra đĩa theo khoá, executor khác kéo về qua mạng. Đây là ranh giới stage và là thao tác đắt nhất trong Spark.

```
df.filter(...).select(...)         → stage 1 (narrow, 1 stage)
  .groupBy("customer_id").sum()    → shuffle → stage 2
  .join(dim, "customer_id")        → shuffle nữa (trừ khi broadcast) → stage 3
  .write(...)
```

Số partition sau shuffle = `spark.sql.shuffle.partitions` (mặc định 200). Dữ liệu 10 GB → 200 partition 50 MB: ổn. Dữ liệu 100 MB → 200 partition 0.5 MB: 200 task tí hon, overhead lớn hơn việc. Dữ liệu 2 TB → 200 partition 10 GB: OOM. AQE (Spark 3) tự gộp partition nhỏ sau shuffle nhưng không tự tách partition quá lớn.

## Đọc tín hiệu

- Job có nhiều stage hơn dự kiến → có shuffle bạn không ngờ (vd `distinct` trước `join`).
- Stage 2 có 200 task nhưng 199 task xong trong 5 giây, 1 task chạy 40 phút → skew.
- "Shuffle read/write" hàng trăm GB trong Spark UI → cân nhắc lọc/gom trước, broadcast, hoặc partition lại nguồn theo khoá join.

## Sai lầm hay gặp

- `orderBy` toàn bộ dữ liệu chỉ để ghi file "đẹp" → shuffle về ít partition, cực chậm. Sắp xếp trong partition (`sortWithinPartitions`) nếu chỉ cần cục bộ.
- `repartition(1)` trước khi ghi để có một file → toàn bộ dữ liệu về một task. Dùng `coalesce(n)` với n hợp lý, hoặc chấp nhận nhiều file.
- Để `shuffle.partitions = 200` cho mọi job từ 10 MB tới 10 TB.
