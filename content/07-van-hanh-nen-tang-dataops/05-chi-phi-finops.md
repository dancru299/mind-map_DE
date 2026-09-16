---
title: Chi phí (FinOps)
tagline: Query rẻ hay đắt là quyết định thiết kế
tools:
  - Billing export
  - Partition pruning
  - Slot reservation
  - Lifecycle policy
  - Spot instance
  - Cost per query
bigtech: >-
  Ở công ty thường, DE thường là người duy nhất hiểu hoá đơn cloud data và bị hỏi thẳng 'sao tháng
  này tăng 40%'. Ở big tech, chi phí được quản lý ở tầng tổ chức.
weight: 4
---

- Warehouse: partition + cluster đúng, tránh SELECT *, materialize bảng hay dùng, giới hạn byte quét theo user, dùng slot/warehouse size hợp lý.
- Storage: lifecycle policy đưa dữ liệu cũ xuống tầng lạnh, xoá bảng không ai dùng (nhờ lineage).
- Compute: tắt cluster khi không dùng, spot instance cho batch.

Theo dõi chi phí theo team/pipeline bằng label và billing export.
