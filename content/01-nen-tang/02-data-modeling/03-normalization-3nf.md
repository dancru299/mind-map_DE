---
title: Normalization & 3NF
tagline: Bài từ OLTP, vẫn cần hiểu để đọc nguồn
tools:
  - 3NF
  - Inmon
  - Denormalization
---

Database ứng dụng (nguồn của bạn) được chuẩn hoá 3NF để tránh trùng lặp khi ghi. Warehouse thì ngược lại — cố ý phi chuẩn hoá để đọc nhanh.

Hiểu 3NF giúp bạn đọc schema nguồn và biết phải join gì để 'làm phẳng' ra bảng phân tích.
