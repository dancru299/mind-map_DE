---
title: Regex & xử lý chuỗi
tagline: Log, tên file, địa chỉ, số điện thoại — 30% việc làm sạch là chuỗi
tools:
  - REGEXP_EXTRACT / REGEXP_REPLACE
  - Named group
  - Anchors ^ $
  - SPLIT / TRIM / NORMALIZE
  - JSON_EXTRACT
weight: 2
---

Regex là công cụ nhỏ dùng mỗi ngày: rút mã đơn từ tên file, tách mã vùng khỏi số điện thoại, parse dòng log, kiểm tra email hợp lệ. Học 10 ký hiệu là dùng được 90%:

```
^ $        đầu / cuối chuỗi           \d \w \s   số / chữ-số-gạch dưới / khoảng trắng
. * + ?    bất kỳ / 0+ / 1+ / 0-1     [abc] [^abc]  tập ký tự / phủ định
( )        nhóm để lấy ra             (?P<name>...) nhóm có tên (Python), (?<name>) (BigQuery/JS)
{2,4}      lặp 2–4 lần                | hoặc          \. ký tự chấm thật
```

```sql
-- BigQuery: tách ngày và mã đối tác từ tên file "orders_partnerA_2025-06-15.csv"
SELECT
  REGEXP_EXTRACT(file_name, r'orders_(\w+)_\d{4}-\d{2}-\d{2}\.csv') AS partner,
  PARSE_DATE('%Y-%m-%d', REGEXP_EXTRACT(file_name, r'(\d{4}-\d{2}-\d{2})')) AS file_date,
  REGEXP_REPLACE(phone, r'[^\d+]', '') AS phone_digits,      -- bỏ khoảng trắng, dấu chấm, gạch
  NORMALIZE(LOWER(TRIM(customer_name)), NFC) AS name_key      -- khoá so khớp tên
FROM raw_files;
```

Ngoài regex: `SPLIT` cho chuỗi có dấu phân cách cố định (rẻ hơn regex), `JSON_EXTRACT`/`JSON_VALUE` cho JSON (đừng regex JSON), `SAFE.PARSE_DATE` để không gãy cả query vì một dòng sai.

## Sai lầm hay gặp

- Regex tham lam (`.*`) ăn quá nhiều: `"a=(.*),b"` trên `a=1,b=2,b=3` lấy `1,b=2`. Dùng `.*?` hoặc `[^,]*`.
- Parse JSON/HTML/CSV bằng regex → sai ở trường hợp lồng nhau, có dấu ngoặc kép. Dùng parser.
- Regex khác nhau giữa engine (Postgres `~`, BigQuery `r'...'` kiểu RE2 không hỗ trợ lookbehind, Python `re`). Test trên đúng engine.
