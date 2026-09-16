---
title: Surrogate key vs natural key
tagline: Khoá "của kho" hay khoá "của nguồn" — và vì sao cần cả hai
tools:
  - Surrogate key
  - Natural / business key
  - Hash key
  - dbt_utils.generate_surrogate_key
weight: 4
---

- **Natural (business) key**: khoá có nghĩa nghiệp vụ, đến từ nguồn — `customer_id` của CRM, mã sản phẩm, số CMND.
- **Surrogate key**: khoá do warehouse sinh, không có nghĩa — số tự tăng hoặc hash. Dimension nên có surrogate key, fact tham chiếu dimension bằng surrogate key.

Vì sao không dùng thẳng natural key?

1. **SCD Type 2**: một khách hàng có nhiều dòng (mỗi phiên bản lịch sử) — natural key không còn duy nhất, cần khoá cho từng phiên bản.
2. **Nhiều nguồn**: hai hệ thống dùng cùng `customer_id = 1001` cho hai người khác nhau.
3. **Nguồn đổi**: migrate CRM, mã khách hàng đổi định dạng — fact không phải sửa.

```sql
-- Hash key: xác định được (chạy lại ra cùng khoá), không cần sequence tập trung — hợp warehouse phân tán
SELECT
  TO_HEX(MD5(CONCAT(COALESCE(source_system, ''), '|', COALESCE(customer_id, ''), '|', CAST(valid_from AS STRING)))) AS customer_key,
  customer_id AS customer_nk,      -- vẫn giữ natural key để trace về nguồn
  source_system, valid_from, valid_to, is_current, ...
FROM ...;
```

dbt: `{{ dbt_utils.generate_surrogate_key(['source_system', 'customer_id', 'valid_from']) }}`.

## Sai lầm hay gặp

- Sequence tự tăng trên warehouse phân tán (BigQuery không có; Snowflake có nhưng không đảm bảo liên tục) → chạy lại pipeline sinh khoá khác → fact trỏ sai. Dùng hash.
- Hash từ cột có thể NULL mà không `COALESCE` → hai bản ghi khác nhau ra cùng hash (hoặc hash NULL).
- Bỏ natural key khỏi dimension → không đối chiếu được với nguồn khi số sai.
