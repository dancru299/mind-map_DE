---
title: Partition khi ghi & small files
tagline: Ghi ra bao nhiêu file, chia theo gì — quyết định tốc độ đọc về sau
tools:
  - partitionBy
  - repartition / coalesce
  - Small files problem
  - maxRecordsPerFile
  - OPTIMIZE / compaction
---

Spark ghi **một file cho mỗi task** (mỗi partition trong bộ nhớ). 800 partition × 30 giá trị `partitionBy("dt")` = 24.000 file nhỏ cho một ngày. Đọc lại phải mở 24.000 file: metadata listing chậm hơn cả đọc dữ liệu. Đây là *small files problem* — nguồn số một của data lake chậm.

Mục tiêu: file **128 MB – 1 GB**, partition thư mục theo cột hay lọc (thường là ngày), số file trong mỗi partition nhỏ.

```python
(df
  .repartition("order_date")                 # gom dữ liệu cùng ngày về cùng task trước khi ghi
  .write
  .mode("overwrite")
  .partitionBy("order_date")                 # thư mục order_date=2025-06-01/
  .option("maxRecordsPerFile", 2_000_000)    # chặn file quá to
  .parquet("gs://silver/orders/"))

# Ghi đè đúng partition có trong batch, không xoá partition khác:
spark.conf.set("spark.sql.sources.partitionOverwriteMode", "dynamic")
```

| Khi cần | Dùng | Lý do |
|---|---|---|
| Giảm số file, không cần đều | `coalesce(n)` | Không shuffle, chỉ gộp partition liền kề — rẻ |
| Chia lại theo cột / tăng số partition | `repartition(n, "col")` | Có shuffle — tốn nhưng cân bằng |
| Bảng Iceberg/Delta đã có nhiều file nhỏ | `OPTIMIZE` / `rewrite_data_files` | Compaction định kỳ, không phải sửa job ghi |

## Chọn cột partition thư mục

- Cardinality thấp-vừa (ngày, vùng, loại): tốt. Cardinality cao (`user_id`): hàng triệu thư mục — không.
- Cột hay xuất hiện trong `WHERE` của người đọc — partition theo thứ không ai lọc là vô ích.
- Table format (Iceberg/Delta) có *hidden partitioning* và clustering, bớt phải nghĩ ở tầng thư mục.

## Sai lầm hay gặp

- `mode("overwrite")` không có `partitionOverwriteMode=dynamic` → xoá **toàn bộ** bảng rồi ghi lại một ngày.
- Job streaming ghi micro-batch mỗi 10 giây → hàng nghìn file mỗi giờ; cần compaction định kỳ.
- Partition theo `timestamp` đầy đủ (mỗi giây một thư mục).
