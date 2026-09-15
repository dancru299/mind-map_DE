---
title: Snowflake
tagline: Tách compute thành nhiều "warehouse" ảo, tính tiền theo giây chạy
tools:
  - Virtual warehouse
  - Micro-partition
  - Clustering key
  - Time Travel / Zero-copy clone
  - Dynamic table
  - Snowpipe
---

Snowflake tách ba tầng: storage (S3/GCS/Azure, nén cột, micro-partition), compute (*virtual warehouse* — cluster tính toán bật/tắt độc lập), và cloud services (metadata, optimizer, auth). Nhiều warehouse ảo đọc cùng dữ liệu mà không tranh nhau: một cho ETL, một cho BI, một cho data science.

## Chi phí

Tính theo **credit × giây warehouse đang chạy** (tối thiểu 60 giây mỗi lần resume), không theo byte. Warehouse size X-Small → 6X-Large, mỗi nấc gấp đôi credit và (lý thuyết) gấp đôi tốc độ. Ba cấu hình tiết kiệm nhất:

```sql
CREATE WAREHOUSE etl_wh
  WAREHOUSE_SIZE = 'MEDIUM'
  AUTO_SUSPEND = 60            -- tắt sau 60 giây rảnh
  AUTO_RESUME = TRUE
  MIN_CLUSTER_COUNT = 1 MAX_CLUSTER_COUNT = 3;   -- multi-cluster: tự thêm cluster khi xếp hàng (Enterprise)

ALTER ACCOUNT SET STATEMENT_TIMEOUT_IN_SECONDS = 3600;   -- chặn query chạy 8 tiếng quên tắt
```

## Micro-partition & clustering

Snowflake tự chia bảng thành micro-partition 50–500 MB theo thứ tự nạp và lưu min/max mỗi cột → *pruning* tự động khi `WHERE` khớp thứ tự dữ liệu (thường là thời gian). Bảng rất lớn lọc theo cột khác thứ tự nạp → đặt `CLUSTER BY (cột)`; Snowflake tự sắp xếp lại nền (tốn credit — chỉ cho bảng > 1 TB và pattern truy vấn rõ).

## Những thứ đáng dùng

- **Time Travel**: `SELECT ... AT (OFFSET => -3600)` — đọc bảng như 1 giờ trước; `UNDROP TABLE`. 1 ngày mặc định, tới 90 ngày (Enterprise).
- **Zero-copy clone**: `CREATE TABLE dev.orders CLONE prod.orders` — tức thì, không tốn storage cho tới khi ghi. Môi trường dev từ prod trong 1 giây.
- **Dynamic table**: bảng tự làm mới theo `TARGET_LAG` từ SQL định nghĩa — thay cho nhiều pipeline incremental đơn giản.
- **Snowpipe**: nạp file từ object storage ngay khi file tới, serverless.

## Sai lầm hay gặp

- `AUTO_SUSPEND` mặc định 10 phút với BI hỏi lắt nhắt → warehouse chạy cả ngày.
- Tăng size warehouse cho query chậm do join sai/skew → tốn gấp đôi, nhanh hơn không đáng kể. Đọc Query Profile trước.
- Một warehouse cho tất cả → ETL nặng làm dashboard treo. Tách theo workload.
- Clone prod sang dev rồi quên xoá → khi prod ghi tiếp, clone bắt đầu tốn storage thật.
