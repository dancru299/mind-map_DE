---
title: One Big Table (OBT)
tagline: Nối sẵn tất cả thành một bảng rộng
tools:
  - Wide table
  - Denormalized
  - Nested/repeated fields
---

Với warehouse cột (BigQuery, Snowflake), join tốn kém còn quét cột thì rẻ, nên xu hướng là làm sẵn bảng rộng phi chuẩn hoá cho từng use case.

Ưu: analyst không cần join, query đơn giản. Nhược: trùng dữ liệu, khó giữ nhất quán khi nhiều OBT cùng tồn tại.
