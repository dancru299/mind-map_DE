---
title: Dữ liệu phi cấu trúc & JSON lồng
tagline: Log, API trả JSON 5 tầng, PDF, ảnh — làm phẳng hay giữ nguyên?
tools:
  - JSON_EXTRACT / JSON_VALUE
  - UNNEST
  - Schema-on-read
  - Flatten
  - Semi-structured
weight: 3
---

Ba mức cấu trúc: **có cấu trúc** (bảng), **bán cấu trúc** (JSON, XML, Avro — có trường nhưng lồng và thay đổi), **phi cấu trúc** (text tự do, PDF, ảnh, audio). DE gặp bán cấu trúc mỗi ngày; phi cấu trúc ngày càng nhiều vì AI.

## JSON lồng: nguyên tắc

1. **Giữ nguyên JSON ở raw** (cột `JSON`/`STRING`) — nguồn đổi cấu trúc thì raw vẫn còn để làm lại.
2. **Làm phẳng ở staging** chỉ những trường bạn dùng; các trường còn lại để trong cột JSON cho analyst tự rút khi cần.
3. **Mảng** → `UNNEST` thành nhiều dòng (đổi grain!) hoặc giữ dạng `ARRAY<STRUCT>` (BigQuery) nếu luôn dùng cùng bản ghi cha.

```sql
-- BigQuery: event có props JSON và mảng items
SELECT
  event_id,
  JSON_VALUE(props, '$.user.id')              AS user_id,        -- scalar → string
  SAFE_CAST(JSON_VALUE(props, '$.amount') AS NUMERIC) AS amount,
  item.sku, item.qty
FROM raw_events,
UNNEST(JSON_QUERY_ARRAY(props, '$.items')) AS item_json,          -- mảng → dòng
UNNEST([STRUCT(JSON_VALUE(item_json, '$.sku') AS sku, SAFE_CAST(JSON_VALUE(item_json, '$.qty') AS INT64) AS qty)]) AS item;
```

**Schema drift**: trường mới xuất hiện, trường cũ đổi kiểu. Phát hiện bằng test schema ở raw; đừng để `CAST` thất bại làm gãy cả pipeline — `SAFE_CAST` + đếm số dòng không parse được.

## Phi cấu trúc

PDF hoá đơn, email, ảnh chứng từ: pipeline = lưu file gốc vào object storage → trích metadata (tên, kích thước, hash, nguồn) vào bảng → trích nội dung bằng OCR/parser/LLM thành text hoặc JSON → từ đó xử lý như bán cấu trúc. Luôn giữ liên kết từ dòng kết quả về file gốc.

## Sai lầm hay gặp

- Làm phẳng hết 80 trường JSON "cho đủ" → bảng rộng, đổi nguồn là sửa 80 cột.
- `UNNEST` mảng rồi `SUM(order_total)` → nhân theo số item (fan-out).
- Parse JSON bằng regex hoặc `SPLIT`.
