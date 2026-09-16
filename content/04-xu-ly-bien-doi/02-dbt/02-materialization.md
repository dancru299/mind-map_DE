---
title: Materialization
tagline: view, table, incremental, ephemeral — chọn theo kích thước và tần suất đọc
tools:
  - view
  - table
  - incremental
  - ephemeral
  - materialized_view
weight: 5
---

Materialization là cách dbt biến `SELECT` của bạn thành đối tượng trong warehouse:

| Loại | Là gì | Dùng khi | Tránh khi |
|---|---|---|---|
| `view` (mặc định) | `CREATE VIEW` — không lưu dữ liệu, chạy lại SELECT mỗi lần đọc | Staging, model nhẹ, luôn cần mới nhất | Logic nặng được đọc nhiều lần |
| `table` | `CREATE TABLE AS` — xây lại toàn bộ mỗi lần chạy | Marts vừa và nhỏ, cần nhanh khi đọc | Bảng rất lớn (xây lại tốn) |
| `incremental` | Lần đầu tạo bảng, các lần sau chỉ xử lý dữ liệu mới | Fact/event lớn, append theo thời gian | Logic cần nhìn toàn bộ lịch sử mỗi lần |
| `ephemeral` | Không tạo gì, được inline thành CTE vào model dùng nó | Bước trung gian nhỏ, không muốn rác warehouse | Được tham chiếu nhiều nơi (tính lại nhiều lần) |
| `materialized_view` | Materialized view của warehouse, tự refresh | Khi warehouse hỗ trợ tốt (BigQuery, Snowflake dynamic table) | Logic phức tạp ngoài giới hạn MV |

```sql
-- Đặt trong file model
{{ config(materialized='table', partition_by={'field': 'order_date', 'data_type': 'date'}, cluster_by=['customer_id']) }}

-- Hoặc theo thư mục trong dbt_project.yml
-- models:
--   my_project:
--     staging: {+materialized: view}
--     marts:   {+materialized: table}
```

Mẹo thực dụng: **bắt đầu bằng `table` cho marts, `view` cho staging**; chỉ chuyển sang `incremental` khi bảng thật sự lớn và thời gian build thành vấn đề. Incremental thêm nhiều cách sai (xem mục Incremental strategy).

## Sai lầm hay gặp

- Mọi thứ là `view` → dashboard chạy lại toàn bộ chuỗi 8 view mỗi lần mở, chậm và tốn.
- `ephemeral` cho model lớn được 5 model khác dùng → tính lại 5 lần (đúng cái bẫy của CTE).
- Đổi materialization từ `incremental` sang `table` mà quên `--full-refresh` → dbt cảnh báo nhưng vẫn dễ bỏ qua.
