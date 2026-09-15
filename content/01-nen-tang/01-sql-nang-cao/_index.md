---
title: SQL nâng cao
tagline: Ngôn ngữ chính của DE — 70% thời gian bạn viết SQL
tools:
  - Window function
  - CTE
  - EXPLAIN
  - Partition pruning
  - QUALIFY
  - MERGE
bigtech: >-
  Công ty thường: SQL là 80% công việc và là tiêu chí tuyển dụng số một. Big tech: vẫn cần nhưng
  thường có DSL/tool nội bộ bọc bên ngoài.
---

SQL trong DE khác SQL trong app: bạn xử lý hàng trăm triệu dòng, quan tâm tới chi phí quét và query plan hơn là trả về nhanh một bản ghi.

- Window functions: ROW_NUMBER, LAG/LEAD, SUM OVER — khử trùng lặp, tính running total, so sánh kỳ trước.
- CTE và subquery: chia bài toán thành bước, tránh SELECT lồng 5 tầng.
- Partition pruning: viết WHERE đúng cột partition để không quét cả bảng.
- Đọc EXPLAIN / query plan: biết vì sao query chậm (full scan, shuffle, skew).
