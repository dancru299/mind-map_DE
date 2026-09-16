---
title: Kiểm tra chất lượng dữ liệu
tagline: Test dữ liệu như test code
tools:
  - dbt test
  - Great Expectations
  - Soda
  - Elementary
  - Anomaly detection
  - Reconciliation
weight: 5
---

Bốn nhóm kiểm tra cơ bản:

- Schema: cột có đúng kiểu, có bị thêm/bớt cột không.
- Volume: số dòng hôm nay có lệch bất thường so với mọi ngày không.
- Freshness: dữ liệu mới nhất cách đây bao lâu.
- Distribution / rule: null rate, giá trị nằm trong tập cho phép, khoá duy nhất, tổng khớp nguồn.

Đặt test ở ranh giới giữa các lớp (raw → staging → marts), fail sớm, chặn dữ liệu xấu đi tiếp.
