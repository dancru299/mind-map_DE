---
title: Datetime, timezone & kiểu dữ liệu
tagline: Nguồn bug số một của mọi warehouse, và cách tránh
tools:
  - UTC
  - TIMESTAMP vs DATETIME
  - Timezone conversion
  - DECIMAL vs FLOAT
  - Unicode / encoding
  - NULL semantics
weight: 5
---

## Thời gian

- **Lưu UTC, hiển thị theo múi giờ người xem.** Nguồn ghi giờ Việt Nam không có múi giờ → khi vào warehouse phải gắn múi giờ rõ ràng, một lần, ở lớp staging.
- **`TIMESTAMP` (có múi giờ, một thời điểm tuyệt đối) ≠ `DATETIME` (giờ trên đồng hồ, không múi giờ).** BigQuery/Postgres phân biệt; trộn hai kiểu là lệch 7 giờ âm thầm.
- **"Ngày" theo múi giờ nào?** Đơn đặt 23:30 giờ VN ngày 15 = 16:30 UTC ngày 15; đơn đặt 01:00 VN ngày 16 = 18:00 UTC ngày 15. Nhóm theo `DATE(ts_utc)` cho ra ngày 15 cho cả hai — sai với báo cáo VN. Chuyển múi giờ **trước** khi lấy `DATE`.
- **DST**: Việt Nam không có, nhưng dữ liệu từ đối tác Mỹ/EU có. Ngày có 23 hoặc 25 giờ; "cộng 1 ngày" ≠ "cộng 24 giờ".
- **Ranh giới**: `BETWEEN '2025-06-01' AND '2025-06-30'` bỏ mất cả ngày 30 nếu cột là timestamp (so với 00:00:00). Dùng `>= start AND < end_exclusive`.

```sql
-- BigQuery: từ UTC sang ngày báo cáo theo giờ VN
SELECT DATE(ordered_at_utc, 'Asia/Ho_Chi_Minh') AS order_date_vn, COUNT(*)
FROM orders
WHERE ordered_at_utc >= TIMESTAMP('2025-06-01', 'Asia/Ho_Chi_Minh')
  AND ordered_at_utc <  TIMESTAMP('2025-07-01', 'Asia/Ho_Chi_Minh')
GROUP BY 1;
```

## Số

- **Tiền dùng `DECIMAL/NUMERIC`, không dùng `FLOAT`.** `0.1 + 0.2 = 0.30000000000000004`; cộng một triệu giao dịch float sẽ lệch vài đồng và kế toán sẽ hỏi.
- **Integer overflow** khi `SUM` cột `INT32` — ép sang `INT64` trước.
- **Chia cho 0** và `NULL` trong phép tính: `NULL + 1 = NULL`; `AVG` bỏ qua NULL, `COUNT(*)` không.

## Chuỗi & NULL

- **Encoding**: file CSV từ Windows Excel thường là CP1252, không phải UTF-8 → "Nguyá»…n". Khai báo encoding khi đọc; chuẩn hoá về UTF-8 ở staging.
- **Unicode normalization**: "Nguyễn" có thể là NFC hoặc NFD — nhìn giống nhau, `=` trả false. Chuẩn hoá NFC.
- **NULL ≠ '' ≠ 'NULL' ≠ 'N/A'**: nguồn gửi đủ kiểu; chuẩn hoá tại staging. `NULL = NULL` là `UNKNOWN`, `NOT IN` với NULL trả rỗng.
- **Khoảng trắng và hoa/thường** trong khoá join: `TRIM(LOWER(email))` trước khi join.

## Sai lầm hay gặp

- Cột `created_at` là string `'15/06/2025'` được `CAST` với format mặc định → tháng/ngày đảo → dữ liệu tháng 6 nằm rải 12 tháng.
- Dùng `CURRENT_DATE()` (UTC trên BigQuery) để lấy "hôm nay" theo VN → sai 7 giờ mỗi ngày.
- Lưu số tiền dạng `STRING` "1,234,567" rồi `SUM`.
