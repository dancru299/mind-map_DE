---
title: Slowly Changing Dimension (SCD)
tagline: Khách hàng đổi địa chỉ — lịch sử giữ thế nào?
tools:
  - SCD Type 2
  - valid_from/valid_to
  - dbt snapshot
  - MERGE
---

Dimension thay đổi theo thời gian. SCD là các cách ghi lại thay đổi đó.

- Type 1: ghi đè, mất lịch sử. Đơn giản, dùng khi lịch sử không quan trọng.
- Type 2: thêm dòng mới với valid_from / valid_to / is_current. Chuẩn nhất, nhưng bảng phình và join phức tạp hơn.
- Type 3: thêm cột previous_value. Chỉ giữ một bước lịch sử.

dbt snapshot là cách phổ biến để làm SCD Type 2 mà không tự viết MERGE.
