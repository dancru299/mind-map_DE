---
title: Môi trường & phát hành
tagline: dev / staging / prod cho dữ liệu
tools:
  - dbt target
  - Sample data
  - Data masking
  - Schema per developer
  - Blue/green
---

Khó hơn app vì dữ liệu prod không copy sang dev được (kích thước, bảo mật). Cách thường dùng: dev dùng mẫu (sample) hoặc dữ liệu giả, schema riêng cho mỗi developer, dbt target theo môi trường.

Không bao giờ chạy thử trực tiếp trên bảng prod.
