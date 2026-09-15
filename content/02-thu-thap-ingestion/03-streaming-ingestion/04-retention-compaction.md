---
title: Retention & log compaction
tagline: Kafka giữ dữ liệu bao lâu — và topic "giữ trạng thái mới nhất mỗi key"
tools:
  - retention.ms / retention.bytes
  - cleanup.policy=compact
  - Tombstone
  - Tiered storage
---

Kafka không phải hàng đợi xoá-sau-khi-đọc: message nằm trong log cho tới khi hết hạn, **bất kể đã có ai đọc hay chưa**. Nhờ vậy nhiều group đọc độc lập và replay được.

## `cleanup.policy=delete` (mặc định)

Xoá segment cũ hơn `retention.ms` (mặc định 7 ngày) hoặc khi vượt `retention.bytes`. Event log, click stream, CDC: đặt retention đủ để backfill khi pipeline hỏng cuối tuần (3–7 ngày), dài hơn nếu đĩa cho phép. Tiered storage (Kafka ≥ 3.6, Confluent) đẩy segment cũ sang object storage rẻ — retention hàng tháng thành khả thi.

## `cleanup.policy=compact`

Với mỗi **key**, chỉ giữ message **mới nhất**; message cũ hơn cùng key bị dọn dần. Topic trở thành "bảng trạng thái hiện tại" có thể rebuild bằng cách đọc từ đầu: cấu hình, hồ sơ người dùng, giá sản phẩm, snapshot CDC.

```
trước compaction:  [u1:name=An] [u2:name=Bình] [u1:name=An Nguyễn] [u2:∅]
sau compaction:    [u1:name=An Nguyễn]                    (u2 bị xoá bởi tombstone)
```

**Tombstone** = message có value `null`: đánh dấu xoá key. Sau `delete.retention.ms` tombstone cũng bị dọn, consumer mới không còn biết key đó từng tồn tại — consumer phải đọc kịp trong khoảng đó.

## Sai lầm hay gặp

- Retention 1 ngày rồi pipeline hỏng thứ Bảy, thứ Hai vào thì dữ liệu Chủ nhật đã mất.
- Dùng compact cho event (mỗi đơn hàng nhiều event cùng key `order_id`) → chỉ còn event cuối, mất lịch sử.
- Không đặt key cho topic compact → không có gì để compact.
- Coi Kafka là nơi lưu lâu dài. Kafka là log vận chuyển; lưu trữ lâu là việc của lake/warehouse.
