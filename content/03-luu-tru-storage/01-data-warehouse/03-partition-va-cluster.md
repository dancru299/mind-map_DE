---
title: Partition vs cluster (khái niệm chung)
tagline: Hai cách sắp xếp dữ liệu vật lý để query đọc ít hơn — áp dụng cho mọi warehouse và lake
tools:
  - Partition pruning
  - Clustering / sort key
  - Z-order (Delta)
  - Hive partitioning
  - Cardinality
---

Warehouse cột không có index kiểu B-tree. Để query rẻ, dữ liệu phải được **xếp sao cho engine bỏ qua được phần không liên quan** — gọi là *data skipping*. Hai công cụ:

| | Partition | Cluster / sort |
|---|---|---|
| Cách làm | Chia bảng thành khối rời theo giá trị cột (thư mục, segment) | Sắp xếp dữ liệu **bên trong** khối theo cột; engine lưu min/max mỗi block |
| Cột phù hợp | Cardinality thấp-vừa: ngày, tháng, vùng | Cardinality cao: `user_id`, `order_id`, `event_name` |
| Tác dụng với | `WHERE` bằng/khoảng trên cột partition | `WHERE`, `JOIN`, `GROUP BY` trên cột cluster |
| Giới hạn | Quá nhiều partition = quá nhiều metadata/file nhỏ | Giảm dần khi thêm dữ liệu lộn xộn; cần re-cluster/compaction |
| Tên ở nơi khác | BigQuery `PARTITION BY`, Hive `dt=`, Iceberg partition spec | BigQuery `CLUSTER BY`, Snowflake `CLUSTER BY`, Redshift `SORTKEY`, Delta `ZORDER BY` |

Công thức thực dụng: **partition theo thời gian (ngày), cluster theo 1–3 cột hay lọc/join nhất**. Bảng dưới ~1 GB thường không cần cả hai.

```sql
-- Kiểm tra query có dùng partition không (BigQuery): so byte quét
-- có pruning:  bytes_processed ≈ kích thước 1 ngày
-- không:       bytes_processed ≈ kích thước cả bảng
SELECT total_bytes_processed, query
FROM `region-asia-southeast1`.INFORMATION_SCHEMA.JOBS
WHERE creation_time > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 DAY)
ORDER BY total_bytes_processed DESC LIMIT 20;    -- top query đắt nhất hôm nay
```

## Sai lầm hay gặp

- Partition theo cột cardinality cao (`user_id`) → hàng triệu partition; hoặc theo cột không ai lọc.
- Cluster theo 4 cột "cho chắc" → cột thứ 3, 4 gần như không tác dụng, còn tốn công sắp xếp.
- Partition theo múi giờ khác múi giờ báo cáo → mọi query "theo ngày VN" phải đọc 2 partition.
- Không đo trước/sau. Thêm partition/cluster là giả thuyết; `bytes_processed` là bằng chứng.
