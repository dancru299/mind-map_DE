---
title: Ước lượng quy mô (back-of-envelope)
tagline: Nhẩm được dữ liệu bao nhiêu GB, query bao nhiêu tiền — trước khi chọn tool
tools:
  - Back-of-envelope
  - Rows × bytes
  - Growth rate
  - Throughput
  - Cost estimate
weight: 4
---

Phần lớn quyết định "có cần Spark không", "có cần partition không", "streaming tốn bao nhiêu" trả lời được bằng phép nhân trong 2 phút. Vài con số nên thuộc:

- 1 dòng sự kiện JSON ≈ 0,5–2 KB; cùng dòng đó ở Parquet nén ≈ 50–200 byte (nén 5–10 lần).
- 1 triệu dòng Parquet ≈ 50–200 MB. 1 tỷ dòng ≈ 50–200 GB.
- BigQuery on-demand ≈ $6,25/TB quét (tuỳ vùng). Quét 100 GB ≈ $0,6. Storage ≈ $0,02/GB/tháng.
- Một máy 8 core xử lý bằng polars/DuckDB thoải mái vài chục GB; trên đó mới nghĩ tới Spark.
- 1 ngày = 86.400 giây. 100 event/giây ≈ 8,6 triệu event/ngày ≈ 3 tỷ/năm.

## Ví dụ: "log click của app, 2 triệu người dùng"

1. Mỗi người 30 event/ngày → 60 triệu event/ngày → ~700 event/giây trung bình, đỉnh ×5 ≈ 3.500/giây.
2. 60 triệu × 1 KB JSON = 60 GB/ngày raw; Parquet ≈ 8 GB/ngày ≈ 3 TB/năm.
3. Query dashboard quét 1 ngày (8 GB, có partition) ≈ $0,05; quét 1 năm không partition ≈ $19 **mỗi lần**.
4. Kết luận: Kafka/Pub/Sub chịu 3.500/giây dễ; lưu Parquet partition theo ngày; warehouse cột; **bắt buộc** partition + `require_partition_filter`; 3 TB/năm chưa cần lakehouse phức tạp.

Đúng cỡ (order of magnitude) là đủ — sai 2 lần không đổi quyết định, sai 100 lần thì đổi.

## Cách luyện

- Với mọi bảng đang có: `bytes / rows` để biết một dòng thật sự nặng bao nhiêu trong warehouse của bạn. Số này chính xác hơn bất kỳ con số chung nào.
- Trước khi viết design doc, điền bảng: dòng/ngày, GB/ngày, GB/năm, query/ngày, $/tháng ước tính.

## Sai lầm hay gặp

- Ước lượng theo hiện tại, quên tăng trưởng và đỉnh (Tết, flash sale).
- Nhầm raw JSON với Parquet — chênh 10 lần.
- Tính chi phí compute, quên chi phí người vận hành hệ thống phức tạp.
