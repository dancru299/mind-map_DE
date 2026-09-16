---
title: Các mẫu làm sạch dữ liệu
tagline: Chuẩn hoá, khử trùng, xử lý thiếu, xử lý ngoại lệ — có quy tắc, không tuỳ hứng
tools:
  - Standardization
  - Deduplication
  - Missing value policy
  - Outlier
  - Quarantine table
weight: 4
---

Làm sạch không phải "sửa cho đẹp" — là **áp quy tắc rõ ràng, ghi lại, và có thể kiểm chứng**. Người đọc bảng phải biết dữ liệu đã bị đổi gì.

| Vấn đề | Mẫu xử lý | Ghi chú |
|---|---|---|
| Kiểu dữ liệu lộn xộn (số dạng chuỗi, ngày nhiều format) | Ép kiểu ở staging với `SAFE_CAST`; dòng không ép được đi vào bảng **quarantine** | Không âm thầm biến thành NULL |
| Chuỗi không nhất quán (hoa/thường, khoảng trắng, dấu) | `TRIM`, `LOWER`/`UPPER`, `NORMALIZE`, bảng ánh xạ (`'HN'`, `'Hà Nội'`, `'Hanoi'` → `'HN'`) | Bảng ánh xạ là seed có owner |
| Trùng lặp | `ROW_NUMBER` theo khoá, giữ bản mới nhất; ghi số dòng bị loại | Xem mục Khử trùng lặp |
| Thiếu (NULL) | Quyết định theo cột: giữ NULL / điền mặc định / điền từ nguồn khác / loại dòng | Ghi chính sách vào docs cột; **không** điền 0 cho số tiền thiếu |
| Ngoại lệ (giá trị vô lý: tuổi 200, đơn -5 triệu) | Cờ `is_suspicious` + đưa vào quarantine, không xoá | Nghiệp vụ quyết định, DE không tự quyết |
| Đơn vị lẫn lộn (cent vs đồng, kg vs g) | Chuẩn hoá về một đơn vị ở staging, tên cột mang đơn vị (`amount_vnd`, `weight_kg`) | |
| Dữ liệu test / nội bộ | Lọc theo danh sách rõ ràng (`is_test_account`), ghi số dòng lọc | Danh sách do team app cung cấp |

```sql
-- Quarantine: dòng không hợp lệ không biến mất, đi sang bảng riêng để xem lại
CREATE OR REPLACE TABLE stg_orders_quarantine AS
SELECT *, 'amount_not_numeric' AS reason FROM raw_orders WHERE SAFE_CAST(amount AS NUMERIC) IS NULL AND amount IS NOT NULL
UNION ALL
SELECT *, 'negative_amount' FROM raw_orders WHERE SAFE_CAST(amount AS NUMERIC) < 0;
```

Mọi bước làm sạch nên **đếm được**: bao nhiêu dòng bị ép kiểu thất bại, bị loại vì trùng, bị đưa vào quarantine — và số đó hiện trên dashboard chất lượng.

## Sai lầm hay gặp

- Làm sạch ở nhiều nơi (staging một ít, mart một ít, dashboard một ít) → không ai biết dữ liệu đã bị đổi gì.
- Xoá dòng "xấu" thay vì cách ly — mất bằng chứng để đi hỏi nguồn.
- Sửa dữ liệu bằng tay trong warehouse ("UPDATE cho xong") — lần chạy sau ghi đè.
