---
title: Producer
tagline: acks, key, idempotence — ghi vào Kafka mà không mất và không trùng
tools:
  - acks=all
  - enable.idempotence
  - Key partitioner
  - linger.ms / batch.size
  - Transactions
weight: 4
---

Producer gom message thành batch, gửi tới leader của partition, chờ xác nhận. Ba cấu hình quyết định độ tin cậy:

| Cấu hình | Ý nghĩa | Chọn |
|---|---|---|
| `acks=0` | Không chờ xác nhận | Log không quan trọng, chấp nhận mất |
| `acks=1` | Leader ghi xong là xác nhận; replica chưa kịp copy mà leader chết → mất | Mặc định cũ, tránh cho dữ liệu nghiệp vụ |
| `acks=all` + `min.insync.replicas=2` | Ít nhất 2 bản ghi xong mới xác nhận | Dữ liệu nghiệp vụ, CDC |
| `enable.idempotence=true` | Broker loại bỏ message gửi lại do retry (theo producer id + sequence) | Luôn bật; là mặc định từ Kafka 3.0 |

```python
from confluent_kafka import Producer
import json

p = Producer({
    "bootstrap.servers": "kafka:9092",
    "acks": "all",
    "enable.idempotence": True,
    "linger.ms": 20,            # chờ tối đa 20ms để gom batch — throughput cao hơn nhiều
    "batch.size": 256 * 1024,
    "compression.type": "zstd",
})

def on_delivery(err, msg):
    if err: log.error("gửi thất bại %s: %s", msg.key(), err)   # KHÔNG được nuốt lỗi

p.produce("orders", key=str(order["customer_id"]), value=json.dumps(order), on_delivery=on_delivery)
p.flush()   # trước khi tiến trình thoát
```

**Idempotent producer** chỉ chống trùng do *retry của chính producer đó*. Ứng dụng crash sau khi gửi nhưng trước khi ghi "đã gửi" vào DB của mình rồi gửi lại → vẫn trùng. Chống cái này cần **transactional outbox** (ghi event vào bảng outbox cùng transaction nghiệp vụ, một tiến trình khác đọc outbox đẩy vào Kafka — hoặc Debezium đọc bảng outbox) hoặc Kafka transactions.

## Sai lầm hay gặp

- Không `flush()` trước khi thoát → message còn trong buffer bị mất, không lỗi gì.
- Callback delivery bỏ trống → mất message âm thầm khi broker từ chối.
- Serialize JSON không có schema → consumer gãy khi producer thêm/đổi trường. Dùng Avro/Protobuf + Schema Registry.
- Tự chọn partition bằng `hash(key) % n` phía app rồi tăng số partition → khác partitioner mặc định, thứ tự vỡ.
