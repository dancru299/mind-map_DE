---
title: Idempotency & Backfill
tagline: Chạy lại mà không sinh trùng, chạy lùi mà ra đúng
tools:
  - Idempotent
  - Backfill
  - INSERT OVERWRITE
  - MERGE
  - logical_date
  - Partition-aligned
weight: 5
---

Idempotent: chạy pipeline cho partition ngày D nhiều lần vẫn ra đúng một kết quả. Cách làm: ghi đè partition (INSERT OVERWRITE / MERGE theo khoá) thay vì INSERT APPEND.

Backfill: chạy lại cho khoảng thời gian trong quá khứ (sau khi sửa bug, thêm cột). Muốn backfill được, pipeline phải nhận logical_date làm tham số thay vì dùng 'hôm nay'.

Hai tính chất này là thứ phân biệt pipeline nghiêm túc với script chạy được.
