---
title: Backup, disaster recovery & RPO/RTO
tagline: Warehouse bị xoá nhầm lúc 4h chiều thứ Sáu — bạn khôi phục được tới đâu, mất bao lâu?
tools:
  - RPO / RTO
  - Time travel
  - Snapshot
  - Cross-region
  - Restore drill
weight: 3
---

- **RPO** (Recovery Point Objective): chấp nhận mất tối đa bao nhiêu dữ liệu — "1 giờ" nghĩa là backup ít nhất mỗi giờ.
- **RTO** (Recovery Time Objective): phải chạy lại trong bao lâu — "4 giờ" nghĩa là quy trình khôi phục phải chạy được trong 4 giờ, kể cả người trực không phải bạn.

Hai con số này do nghiệp vụ chọn (và trả tiền), DE thiết kế để đạt.

## Các lớp bảo vệ, rẻ tới đắt

1. **Time travel / snapshot của warehouse** (BigQuery 7 ngày, Snowflake 1–90 ngày, Iceberg snapshot): chống xoá/ghi đè nhầm. Gần như miễn phí — nhưng chỉ trong cửa sổ ngắn.
2. **Raw giữ đủ lâu + pipeline idempotent**: mất mart thì build lại từ raw. Đây là backup rẻ nhất của DE — miễn là raw còn và pipeline chạy lại được (backfill).
3. **Object storage versioning + lifecycle**: file bị xoá vẫn có phiên bản cũ.
4. **Snapshot định kỳ sang bucket/project khác** (khác quyền IAM): chống xoá cả project, chống ransomware, chống lỗi người có quyền cao.
5. **Cross-region** khi RTO tính bằng giờ và vùng cloud có thể sập.

Đừng quên **metadata**: DB của Airflow, catalog, Schema Registry, lock file, cấu hình Terraform — mất chúng là pipeline không chạy được dù dữ liệu còn.

## Restore drill

Backup chưa từng khôi phục thử = không có backup. Mỗi quý: chọn một bảng/một pipeline, xoá trên môi trường staging, khôi phục theo runbook, đo thời gian, sửa runbook.

## Sai lầm hay gặp

- Tin "cloud tự backup" — cloud bảo vệ khỏi hỏng đĩa, không bảo vệ khỏi `DROP TABLE` của bạn.
- Backup nằm cùng project/quyền với dữ liệu gốc → xoá nhầm một lần mất cả hai.
- RPO/RTO không được ai chốt → khi sự cố xảy ra mới cãi nhau "chấp nhận được không".
