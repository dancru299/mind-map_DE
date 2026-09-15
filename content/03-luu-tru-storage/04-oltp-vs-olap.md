---
title: OLTP vs OLAP
tagline: Postgres cho app, warehouse cho phân tích
tools:
  - OLTP
  - OLAP
  - Row store
  - Column store
  - Read replica
---

OLTP: nhiều giao dịch nhỏ, index theo khoá, chuẩn hoá, ưu tiên latency ms. OLAP: ít query nhưng quét hàng tỷ dòng, lưu theo cột, phi chuẩn hoá, ưu tiên throughput.

Khi analyst chạy query nặng trực tiếp trên DB production → app chậm, DBA giận. Đây là lý do DE tồn tại.
