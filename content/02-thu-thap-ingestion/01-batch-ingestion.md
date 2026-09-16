---
title: Batch ingestion
tagline: "Kéo theo lịch: full load hoặc incremental"
tools:
  - Full load
  - Incremental
  - Watermark
  - updated_at
  - Late-arriving data
weight: 5
---

- Full load: lấy lại toàn bộ bảng mỗi lần. Đơn giản, đúng tuyệt đối, nhưng tốn và không scale.
- Incremental: chỉ lấy dòng mới/đổi dựa trên cột updated_at hoặc ID tăng dần (watermark). Rẻ nhưng bỏ sót nếu nguồn xoá dòng hoặc cập nhật không đụng updated_at.
- Snapshot theo ngày: lưu mỗi ngày một bản, dễ làm point-in-time nhưng tốn chỗ.

Luôn hỏi: dòng bị xoá ở nguồn thì mình biết bằng cách nào?
