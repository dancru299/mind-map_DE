---
title: Incremental strategy
tagline: append / merge / delete+insert / insert_overwrite / microbatch — chọn sai là dữ liệu trùng hoặc mất
tools:
  - is_incremental()
  - unique_key
  - merge
  - insert_overwrite
  - microbatch
  - --full-refresh
---

Model incremental cần trả lời hai câu: **lấy dòng mới bằng cách nào** (điều kiện trong `is_incremental()`), và **ghi vào bảng đích thế nào** (strategy).

```sql
{{ config(
    materialized='incremental',
    incremental_strategy='merge',
    unique_key='order_id',
    partition_by={'field': 'ordered_at', 'data_type': 'timestamp', 'granularity': 'day'},
    on_schema_change='append_new_columns'
) }}

SELECT order_id, customer_id, ordered_at, order_total, updated_at
FROM {{ ref('stg_shopify__orders') }}
{% if is_incremental() %}
  -- nhìn lùi 3 ngày để bắt dữ liệu đến trễ; MERGE theo unique_key nên không sinh trùng
  WHERE updated_at >= (SELECT MAX(updated_at) FROM {{ this }}) - INTERVAL 3 DAY
{% endif %}
```

| Strategy | Hành vi | Hợp với | Cần |
|---|---|---|---|
| `append` | Chỉ INSERT | Event log không bao giờ cập nhật | Nguồn không gửi trùng |
| `merge` | UPSERT theo `unique_key` | Bảng có cập nhật (đơn hàng đổi trạng thái) | `unique_key`; tốn hơn append |
| `delete+insert` | Xoá các khoá có trong batch mới rồi INSERT | Engine không có MERGE tốt | `unique_key` |
| `insert_overwrite` | Thay thế **cả partition** có trong batch mới | Bảng partition theo ngày, xử lý lại nguyên ngày | `partition_by`; idempotent tự nhiên |
| `microbatch` (dbt ≥ 1.9) | dbt tự chia theo `event_time` thành từng batch (ngày/giờ), chạy lại được từng batch | Bảng thời gian lớn, cần backfill theo khoảng | `event_time`, `batch_size`, `lookback` |

## Sai lầm hay gặp

- `append` với nguồn CDC gửi cập nhật → mỗi lần đổi trạng thái là một dòng mới, đơn hàng bị đếm 3 lần.
- Điều kiện `WHERE updated_at > MAX(updated_at)` không có lookback → dữ liệu đến trễ (event 23:59 tới lúc 00:10) bị bỏ sót mãi mãi.
- `unique_key` không thật sự duy nhất → MERGE lỗi hoặc cập nhật sai dòng.
- Đổi logic SELECT nhưng không `--full-refresh` → dữ liệu cũ vẫn theo logic cũ, chỉ dữ liệu mới theo logic mới. Ghi vào PR: "cần full refresh".
- Thêm cột mà `on_schema_change` mặc định là `ignore` → cột mới không xuất hiện, không báo lỗi.
