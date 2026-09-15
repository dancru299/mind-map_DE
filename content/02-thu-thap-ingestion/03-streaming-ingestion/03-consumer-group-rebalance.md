---
title: Consumer group, offset commit & rebalance
tagline: Đọc song song, nhớ đã đọc tới đâu, và điều gì xảy ra khi thêm/bớt consumer
tools:
  - group.id
  - enable.auto.commit
  - auto.offset.reset
  - Rebalance
  - Consumer lag
---

**Consumer group**: các consumer cùng `group.id` chia nhau partition của topic — mỗi partition được đúng một consumer trong group đọc. 6 partition, 3 consumer → mỗi consumer 2 partition; 8 consumer → 2 consumer ngồi không. Hai group khác nhau đọc độc lập, mỗi group có offset riêng (một topic phục vụ cả warehouse lẫn fraud detection).

**Offset commit**: consumer ghi lại "đã xử lý tới offset X" vào Kafka (`__consumer_offsets`). Thời điểm commit quyết định ngữ nghĩa:

- Commit **trước** khi xử lý → crash giữa chừng thì message mất: *at-most-once*.
- Commit **sau** khi xử lý → crash sau xử lý trước commit thì đọc lại: *at-least-once* (mặc định thực dụng; downstream phải idempotent).
- Exactly-once: Kafka transactions (Kafka → Kafka) hoặc lưu offset cùng transaction với dữ liệu ở sink (Kafka → DB).

```python
from confluent_kafka import Consumer

c = Consumer({"bootstrap.servers": "kafka:9092", "group.id": "orders-to-bq",
              "enable.auto.commit": False,          # tự commit sau khi ghi xong
              "auto.offset.reset": "earliest"})     # group mới: đọc từ đầu (latest = chỉ từ bây giờ)
c.subscribe(["orders"])
while True:
    msgs = c.consume(num_messages=500, timeout=1.0)
    if not msgs: continue
    write_to_bigquery([m.value() for m in msgs])    # idempotent (MERGE theo order_id)
    c.commit(asynchronous=False)                     # commit sau khi ghi thành công
```

**Rebalance**: consumer vào/ra group (deploy, crash, `max.poll.interval.ms` quá hạn) → Kafka chia lại partition. Trong lúc rebalance cả group ngừng đọc. Cooperative rebalancing (Kafka ≥ 2.4) chỉ di chuyển partition cần thiết.

**Consumer lag** = offset mới nhất − offset đã commit: chỉ số giám sát quan trọng nhất. Lag tăng đều = consumer không theo kịp producer.

## Sai lầm hay gặp

- `enable.auto.commit=true` (mặc định) với xử lý chậm → commit trước khi xử lý xong → mất message khi crash.
- Xử lý một batch lâu hơn `max.poll.interval.ms` (5 phút) → bị đá khỏi group → rebalance liên tục, không bao giờ commit.
- Nhiều consumer hơn partition rồi thắc mắc vì sao không nhanh hơn.
- `auto.offset.reset=latest` cho pipeline mới → bỏ qua toàn bộ lịch sử.
