---
title: Topic, partition, offset
tagline: Ba khái niệm quyết định thứ tự, song song và khả năng replay
tools:
  - Topic
  - Partition
  - Offset
  - Key
  - Replication factor
---

- **Topic**: một luồng sự kiện có tên (`orders`, `page_views`). Producer ghi vào, consumer đọc ra.
- **Partition**: topic được chia thành N partition — mỗi partition là một **log chỉ append, có thứ tự**. Partition là đơn vị song song: N partition thì tối đa N consumer trong một group đọc đồng thời.
- **Offset**: số thứ tự của message trong partition. Consumer nhớ offset đã đọc tới đâu; muốn đọc lại từ đầu thì đặt lại offset — đây là **replay**.
- **Key**: message có key thì được hash vào một partition cố định → **mọi sự kiện cùng key đi cùng partition, giữ đúng thứ tự**. Không có key: round-robin, không đảm bảo thứ tự giữa các message.

```
topic "orders", 3 partition, key = customer_id

partition 0: [c1:created] [c1:paid] [c7:created] [c1:shipped]  ← c1 luôn đúng thứ tự
partition 1: [c2:created] [c5:created] [c2:paid]
partition 2: [c3:created] [c3:cancelled]
             offset 0     offset 1     offset 2     offset 3
```

Thứ tự **chỉ được đảm bảo trong một partition**. "Kafka giữ thứ tự toàn cục" là sai.

**Replication factor** (thường 3): mỗi partition có 1 leader + 2 replica trên broker khác; broker chết không mất dữ liệu.

## Chọn số partition

Nhiều partition = song song hơn nhưng nhiều file, nhiều kết nối, rebalance lâu hơn. Ước lượng: throughput mục tiêu ÷ throughput một consumer, cộng dư cho tăng trưởng. Tăng partition sau này **được**, nhưng key sẽ hash sang partition khác — thứ tự cho key đó bị đứt tại thời điểm tăng.

## Sai lầm hay gặp

- Không đặt key cho event cần thứ tự (trạng thái đơn hàng) → consumer thấy `shipped` trước `paid`.
- Key có cardinality thấp (`country`, 5 giá trị) → 5 partition nóng, còn lại trống — skew ở tầng Kafka.
- Một topic cho mọi loại event ("events") → consumer phải đọc tất cả để lọc 2%.
