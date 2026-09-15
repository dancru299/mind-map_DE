---
title: Anti-pattern chi phí warehouse
tagline: Mười cách phổ biến để hoá đơn tăng 40% mà không ai để ý
tools:
  - INFORMATION_SCHEMA.JOBS
  - Billing export
  - maximum_bytes_billed
  - Query cache
  - Storage tiering
bigtech: >-
  Ở big tech chi phí compute được quản lý ở mức tổ chức và DE ít khi thấy hoá đơn. Ở công ty thường, DE thường là
  người duy nhất đọc được billing export và bị hỏi thẳng "sao tháng này tăng".
---

| Anti-pattern | Vì sao đắt | Sửa |
|---|---|---|
| Dashboard "live" query bảng fact tỷ dòng mỗi lần mở | Mỗi người mở = một lần quét | Bảng tổng hợp (aggregate) theo ngày; BI extract/cache; BI Engine |
| `SELECT *` trong model dbt staging | Mọi cột đi qua mọi lớp | Liệt kê cột cần |
| Model `table` full refresh mỗi giờ cho bảng 500 GB | 24 lần xây lại / ngày | `incremental` + partition; hoặc giảm tần suất |
| Không có `require_partition_filter` / `STATEMENT_TIMEOUT` | Một query nhầm = một tháng ngân sách | Bật mặc định trên bảng lớn và tài khoản analyst |
| Test dbt `unique`/`relationships` trên bảng tỷ dòng mỗi run | Mỗi test là một scan | `where:` giới hạn 7 ngày gần nhất |
| Job retry vô hạn trên query lỗi | Chạy đi chạy lại | `retries` hữu hạn + alert |
| Bảng tạm, bảng `_backup_2023`, schema dev không dọn | Storage tích luỹ | Expiration mặc định cho dataset dev/tmp; lifecycle policy |
| Warehouse Snowflake không auto-suspend | Tính tiền khi rảnh | `AUTO_SUSPEND = 60` |
| Query giống nhau chạy 200 lần/ngày từ notebook | Không dùng cache vì khác khoảng trắng/tham số | Materialize thành bảng; dạy team dùng cache |
| Ai cũng có quyền chạy query không giới hạn | Không có người chịu trách nhiệm | Quota theo user/project; label query theo team; báo cáo chi phí hàng tuần |

```sql
-- BigQuery: ai / query nào tốn nhất 7 ngày qua
SELECT user_email, COUNT(*) AS queries,
       ROUND(SUM(total_bytes_billed) / POW(1024, 4), 2) AS tb_billed,
       ROUND(SUM(total_bytes_billed) / POW(1024, 4) * 6.25, 2) AS usd_estimate
FROM `region-asia-southeast1`.INFORMATION_SCHEMA.JOBS_BY_PROJECT
WHERE creation_time > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY) AND job_type = 'QUERY'
GROUP BY 1 ORDER BY tb_billed DESC LIMIT 20;
```

Thói quen đáng tiền nhất: **một dashboard chi phí theo team/pipeline, xem mỗi tuần**. Chi phí tăng 40% không xảy ra trong một ngày; nó tích luỹ từ 10 quyết định nhỏ không ai đo.

## Sai lầm hay gặp

- Tối ưu query đắt nhất *một lần* thay vì query tốn nhất *tổng cộng* (chạy nhiều lần).
- Bật slot reservation/commit lớn để "tiết kiệm" khi workload chưa ổn định.
- Coi storage là miễn phí — storage rẻ nhưng bảng 50 TB không ai dùng vẫn là tiền mỗi tháng, và lineage cho biết bảng nào không ai đọc.
