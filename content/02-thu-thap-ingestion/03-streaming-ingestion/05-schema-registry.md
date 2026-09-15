---
title: Schema Registry & tương thích
tagline: Producer thêm trường, consumer cũ không gãy — nếu có hợp đồng
tools:
  - Schema Registry
  - Avro / Protobuf / JSON Schema
  - BACKWARD / FORWARD / FULL
  - Subject
---

Kafka chỉ thấy byte. Producer gửi JSON tuỳ tiện, đổi tên trường `amount` → `total_amount`, consumer đọc `NULL` mà không lỗi gì. Schema Registry đặt một **hợp đồng có kiểm tra tự động** giữa hai bên:

1. Producer đăng ký schema (Avro/Protobuf/JSON Schema) cho topic (một *subject*, thường `orders-value`).
2. Message chỉ mang **id của schema** (5 byte) thay vì tên trường lặp lại → nhỏ hơn JSON nhiều.
3. Khi producer muốn đổi schema, Registry **kiểm tra tương thích** với phiên bản trước và từ chối thay đổi phá vỡ.

| Chế độ | Ai được cập nhật trước | Được phép | Không được |
|---|---|---|---|
| `BACKWARD` (mặc định) | Consumer trước, producer sau | Xoá trường; thêm trường **có default** | Thêm trường bắt buộc |
| `FORWARD` | Producer trước | Thêm trường; xoá trường có default | Xoá trường bắt buộc |
| `FULL` | Bất kỳ | Chỉ thêm/xoá trường có default | Còn lại |
| `NONE` | — | Mọi thứ | — (đừng dùng cho dữ liệu nghiệp vụ) |

```json
{
  "type": "record", "name": "Order", "namespace": "shop.events",
  "fields": [
    {"name": "order_id",    "type": "string"},
    {"name": "customer_id", "type": "string"},
    {"name": "amount",      "type": {"type": "bytes", "logicalType": "decimal", "precision": 18, "scale": 2}},
    {"name": "channel",     "type": ["null", "string"], "default": null}   // trường mới, có default → BACKWARD OK
  ]
}
```

Với pipeline vào warehouse, chế độ `BACKWARD` là đủ: consumer (pipeline) cập nhật khi cần, producer thêm trường có default lúc nào cũng được.

## Sai lầm hay gặp

- Đổi **kiểu** trường (`int` → `string`) với cùng tên → không chế độ nào cho phép; thêm trường mới và giữ trường cũ một thời gian.
- Đặt `NONE` "để đỡ phiền" → trở lại tình trạng JSON tuỳ tiện.
- Consumer parse JSON thủ công dù đã có Registry → không hưởng gì.
- Quên rằng Registry là thành phần có trạng thái cần backup — mất Registry là không đọc được message cũ.
