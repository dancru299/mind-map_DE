---
title: Đọc Spark UI & xử lý OOM
tagline: Tìm đúng stage chậm, hiểu vì sao executor chết
tools:
  - Spark UI (Jobs / Stages / SQL)
  - Task duration distribution
  - Spill (memory / disk)
  - GC time
  - executor.memoryOverhead
---

Spark UI (port 4040 khi chạy, History Server sau đó; Databricks/EMR có sẵn) là nơi trả lời "job chậm ở đâu". Đường đi khi debug:

1. **Tab SQL / DataFrame**: nhìn plan dạng đồ thị — thấy Exchange (shuffle), BroadcastHashJoin vs SortMergeJoin, số dòng qua mỗi bước. Số dòng tăng vọt sau join = fan-out.
2. **Tab Jobs → Stages**: stage nào chiếm phần lớn thời gian.
3. **Trong stage → Summary metrics**: phân phối thời gian task (min / median / max). Max ≫ median = skew. "Shuffle spill (disk)" lớn = thiếu RAM, dữ liệu tràn ra đĩa.
4. **Tab Executors**: GC time cao (>10% task time) = executor thiếu bộ nhớ; executor "dead" = OOM hoặc bị cluster manager giết.

## OOM — ba loại và cách xử lý

| Lỗi | Nguyên nhân thường gặp | Xử lý |
|---|---|---|
| Driver OOM | `collect()`, `toPandas()`, broadcast bảng quá lớn, quá nhiều task metadata | Không collect bảng lớn; giảm `autoBroadcastJoinThreshold`; tăng `driver.memory` |
| Executor OOM (Java heap) | Partition quá lớn sau shuffle, skew, cache quá nhiều | Tăng `shuffle.partitions`, salting, `unpersist`, giảm `executor.cores` để mỗi task có nhiều RAM hơn |
| "Container killed by YARN/K8s for exceeding memory limits" | Bộ nhớ ngoài heap (PySpark worker, Arrow, netty) vượt `memoryOverhead` | Tăng `spark.executor.memoryOverhead` (PySpark thường cần 20–30%) |

```python
# PySpark UDF chạy trong tiến trình Python riêng, không nằm trong JVM heap
spark.conf.set("spark.executor.memoryOverhead", "3g")
# Tránh UDF Python khi có hàm sẵn: F.regexp_extract, F.from_json, F.transform... nhanh hơn 10–100 lần
```

## Sai lầm hay gặp

- Phản xạ "tăng RAM" khi OOM thay vì tìm partition/skew — job vẫn OOM khi dữ liệu tăng 20%.
- UDF Python cho việc mà hàm built-in làm được → serialize từng dòng qua lại Python ↔ JVM.
- `cache()` mọi DataFrame "cho chắc" → executor đầy cache, không còn chỗ cho shuffle.
- Không bật History Server → job hỏng lúc 3h sáng, sáng ra không còn UI để xem.
