---
title: Kiến trúc Medallion
tagline: "Bronze → Silver → Gold: quy ước lớp dữ liệu"
tools:
  - Bronze
  - Silver
  - Gold
  - Staging
  - Marts
  - Raw layer
---

- Bronze (raw): bản sao nguồn, không sửa gì. Để làm lại khi cần.
- Silver (cleaned): đã chuẩn hoá kiểu dữ liệu, khử trùng, join cơ bản, đã test.
- Gold (marts): bảng theo nghiệp vụ, sẵn cho BI và ML.

Tên khác nhau (raw/staging/marts, L1/L2/L3) nhưng ý tưởng giống nhau: mỗi lớp có hợp đồng rõ ràng.
