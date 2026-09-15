---
title: Data modeling
tagline: Cách tổ chức bảng để dữ liệu dùng được, đúng và rẻ
tools:
  - Kimball
  - Inmon
  - Data Vault
  - Star schema
  - Grain
bigtech: >-
  Công ty thường: modeling gắn chặt với nghiệp vụ, DE phải hiểu business để chọn grain đúng. Big
  tech: thường có team riêng định nghĩa metric và schema chuẩn.
---

Modeling là kỹ năng tách người DE giỏi khỏi người chỉ biết nối tool. Bảng thiết kế sai thì mọi dashboard phía sau sai theo, và sửa lại rất tốn.

Ba trường phái lớn: dimensional (Kimball) cho analytics, 3NF/Inmon cho warehouse doanh nghiệp, Data Vault cho hệ thống nhiều nguồn thay đổi liên tục.
