---
title: ETL vs ELT
tagline: Biến đổi trước hay sau khi tải vào kho?
tools:
  - ELT
  - ETL
  - Informatica
  - SSIS
  - Modern Data Stack
weight: 5
---

- ETL (truyền thống): biến đổi trên server trung gian (Informatica, SSIS, Spark) rồi mới tải vào warehouse. Warehouse cũ yếu nên phải làm vậy.
- ELT (hiện đại): tải thô vào warehouse trước, biến đổi bằng SQL ngay trong đó. Warehouse hiện đại đủ mạnh và rẻ để làm thế.

ELT giữ được raw, dễ debug, analyst tự làm được. Đây là nền của Modern Data Stack.
