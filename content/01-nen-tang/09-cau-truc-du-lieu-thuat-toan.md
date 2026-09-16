---
title: Cấu trúc dữ liệu & thuật toán cho data
tagline: Vì sao hash join nhanh, sort đắt, và Bloom filter ở khắp nơi
tools:
  - Hash table
  - Sort-merge vs hash join
  - Bloom filter
  - B-tree vs LSM tree
  - Big-O cho dữ liệu lớn
weight: 3
---

Không cần Leetcode, nhưng cần hiểu vài cấu trúc để đọc plan, chọn engine, và biết vì sao query chậm.

- **Hash table → hash join, hash aggregate.** Xây bảng băm từ bên nhỏ, quét bên lớn: O(n+m). Bên "nhỏ" phải vừa RAM — đây là điều kiện của broadcast join. Skew = một bucket băm nhận hết dữ liệu.
- **Sort → sort-merge join, window function, ORDER BY.** O(n log n) và phải shuffle toàn bộ. Engine chọn sort-merge khi cả hai bên đều lớn. `ORDER BY` không có `LIMIT` trên tỷ dòng là thao tác đắt nhất bạn có thể yêu cầu.
- **Bloom filter**: cấu trúc "có thể có / chắc chắn không có", rất nhỏ. Parquet, Iceberg, Spark dùng để bỏ qua file/row group không chứa khoá đang tìm — lý do `WHERE user_id = X` trên lake vẫn nhanh.
- **Columnar + dictionary/RLE encoding**: cột ít giá trị phân biệt nén cực tốt → cột `status` 1 tỷ dòng chỉ vài MB. Giải thích vì sao chọn đúng cột rẻ hơn `SELECT *` hàng chục lần.
- **B-tree (Postgres index) vs LSM tree (Cassandra, RocksDB, HBase)**: B-tree đọc nhanh, ghi tốn; LSM ghi nhanh, đọc phải merge — lý do DB ghi nhiều chọn LSM.
- **Min/max statistics per block**: mọi engine cột lưu min/max mỗi khối để bỏ qua khối — hiệu quả chỉ khi dữ liệu được sắp xếp/cluster theo cột lọc.
- **Big-O thực dụng**: 1 tỷ dòng × O(n) = ổn; O(n²) (cross join, self join không khoá) = không bao giờ xong.

## Sai lầm hay gặp

- Join hai bảng lớn mà không lọc trước → sort-merge trên cả hai, shuffle hàng trăm GB.
- Tưởng index Postgres "tự giúp" khi query trên warehouse cột — warehouse cột không có B-tree index.
- `DISTINCT` trên tỷ dòng để "xem có bao nhiêu giá trị" — dùng `APPROX_COUNT_DISTINCT` (HyperLogLog).
