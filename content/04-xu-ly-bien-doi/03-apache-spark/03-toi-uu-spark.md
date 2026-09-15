---
title: Tối ưu Spark
tagline: Vì sao job chạy 3 tiếng và cách làm còn 20 phút
tools:
  - AQE
  - Salting
  - Broadcast
  - Coalesce
  - Spark UI
  - Small files problem
---

- Skew: một khoá chiếm 80% dữ liệu → một task chạy mãi. Sửa bằng salting, AQE skew join.
- Broadcast join: bảng nhỏ gửi tới mọi executor, tránh shuffle.
- Repartition / coalesce: điều chỉnh số partition trước khi ghi để không sinh 10.000 file nhỏ.
- Cache đúng chỗ, tránh collect() về driver, đọc Spark UI để tìm stage chậm.
