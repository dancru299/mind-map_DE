---
title: BigQuery
tagline: Serverless, tính tiền theo byte quét — thiết kế bảng là thiết kế hoá đơn
tools:
  - Partition / Cluster
  - On-demand vs Editions (slot)
  - Nested & repeated (STRUCT / ARRAY)
  - Materialized view
  - BI Engine
  - Dry run
bigtech: >-
  BigQuery là bản thương mại của Dremel — hệ thống nội bộ Google. Ở Google, DE dùng Dremel/F1 với công cụ nội bộ;
  ở công ty thường, BigQuery là warehouse phổ biến nhất trong hệ GCP và chi phí query là chuyện DE bị hỏi mỗi tháng.
---

BigQuery tách hoàn toàn storage (Colossus) và compute (Dremel, chia theo *slot*). Bạn không quản lý server, không tạo index; bạn quản lý **bao nhiêu byte mỗi query đọc**.

## Hai mô hình giá

- **On-demand**: ~$6.25 / TB quét (giá thay đổi theo vùng). Query `SELECT *` trên bảng 2 TB = ~$12.5 dù chỉ lấy 10 dòng. 1 TB đầu mỗi tháng miễn phí.
- **Editions (slot)**: mua năng lực tính toán (slot) theo giờ/cam kết, không tính byte. Hợp khi khối lượng lớn, ổn định; on-demand hợp khi nhỏ hoặc thất thường.

## Partition + cluster — hai đòn bẩy chi phí

```sql
CREATE TABLE analytics.fct_events (
  event_ts   TIMESTAMP, event_date DATE, user_id STRING, event_name STRING, props JSON
)
PARTITION BY event_date                 -- tối đa 10.000 partition; theo ngày là phổ biến nhất
CLUSTER BY user_id, event_name          -- tối đa 4 cột; sắp xếp trong partition, lọc/gom theo cột này rẻ hơn
OPTIONS (partition_expiration_days = 400, require_partition_filter = TRUE);  -- bắt buộc WHERE trên partition
```

`require_partition_filter=TRUE` là bảo hiểm rẻ nhất chống query quét cả bảng. Cluster có tác dụng với `WHERE`, `GROUP BY`, `JOIN` trên cột cluster, hiệu quả giảm dần từ cột đầu.

## Nested & repeated

BigQuery lưu `STRUCT` và `ARRAY` gốc — một đơn hàng và các dòng hàng trong **một dòng**, không cần join:

```sql
SELECT o.order_id, li.product_id, li.qty
FROM analytics.orders o, UNNEST(o.line_items) AS li      -- "làm phẳng" khi cần
WHERE o.order_date = '2025-06-01';
```

Tránh join lớn, nhưng analyst không quen `UNNEST`; thường giữ nested ở lớp raw/silver, phẳng hoá ở marts.

## Sai lầm hay gặp

- `SELECT *` để "xem thử" trên bảng TB — dùng tab Preview (miễn phí) hoặc `LIMIT` **không giảm byte quét**; chọn cột mới giảm.
- Bọc cột partition trong hàm (`DATE(event_ts) = ...`) → mất pruning. Tạo cột `event_date` riêng.
- Bảng nhỏ (< 1 GB) cũng partition → hàng nghìn partition tí hon, chậm hơn không partition.
- Không đặt `maximum_bytes_billed` cho user/analyst → một query nhầm tốn cả tháng ngân sách.
- Streaming insert giá riêng và dữ liệu nằm trong buffer chưa partition ~90 phút — query trong lúc đó quét buffer.
