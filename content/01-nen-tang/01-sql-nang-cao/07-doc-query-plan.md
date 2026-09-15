---
title: Đọc query plan
tagline: Biết vì sao query chậm trước khi đổi bất cứ gì
tools:
  - EXPLAIN / EXPLAIN ANALYZE
  - BigQuery execution details
  - Snowflake Query Profile
  - Spark UI
  - Partition pruning
bigtech: >-
  Big tech có công cụ profiling nội bộ và đội tối ưu engine; DE thường được dạy đọc plan từ ngày đầu.
  Công ty thường: ít ai đọc plan, mọi người "thử đổi query xem có nhanh hơn không" — biết đọc plan là lợi thế rõ rệt.
---

Plan là cách engine kể lại nó sẽ làm gì: quét bảng nào, lọc ở đâu, join theo cách nào, dữ liệu di chuyển ra sao giữa các máy. Đổi query mà không đọc plan là đoán mò.

## Những thứ cần tìm trong plan

| Dấu hiệu | Ý nghĩa | Hướng xử lý |
|---|---|---|
| Full scan bảng lớn | Không dùng được partition/cluster | Thêm `WHERE` trên cột partition; không bọc cột partition trong hàm |
| Shuffle / Exchange / Repartition | Dữ liệu chuyển giữa máy cho join/group | Lọc trước, gom nhỏ trước khi join; broadcast bảng nhỏ |
| Nested loop join trên bảng lớn | Không có hash join vì kiểu/điều kiện lạ | Sửa điều kiện join thành đẳng thức, cùng kiểu |
| Bytes processed lớn hơn kỳ vọng | `SELECT *` hoặc quét nhiều partition | Chọn đúng cột; kiểm tra partition filter |
| Một stage chạy lâu hơn hẳn các stage khác | Skew — một khoá quá lớn | Salting, tách khoá nóng xử lý riêng |

```sql
-- Postgres: plan kèm thời gian thực
EXPLAIN (ANALYZE, BUFFERS) SELECT ...;

-- BigQuery: dry run cho biết sẽ quét bao nhiêu byte mà không tốn tiền
-- bq query --dry_run 'SELECT ...'
-- hoặc xem "Execution details" sau khi chạy: stage, slot time, bytes shuffled
```

## Partition pruning — chỗ tiết kiệm nhiều nhất

```sql
-- Có pruning: engine chỉ đọc partition ngày 2025-06-01
SELECT * FROM events WHERE event_date = '2025-06-01';

-- Mất pruning: cột partition bị bọc trong hàm, engine phải quét tất cả rồi mới lọc
SELECT * FROM events WHERE DATE(event_ts) = '2025-06-01';
SELECT * FROM events WHERE event_date = (SELECT MAX(d) FROM calendar);  -- BigQuery: subquery không prune
```

## Sai lầm hay gặp

- So sánh thời gian chạy khi cache đang bật (BigQuery cache 24h, Snowflake result cache) rồi kết luận query "nhanh hơn".
- Tối ưu query chạy 1 lần/ngày mất 3 phút trong khi bỏ qua query dashboard chạy 500 lần/ngày mất 10 giây.
- Thêm cluster/index theo cảm tính thay vì theo pattern `WHERE`/`JOIN` thật sự trong log query.
