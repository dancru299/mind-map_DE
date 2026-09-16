---
title: Retention, xoá dữ liệu & quyền được quên
tagline: Giữ bao lâu, xoá thế nào trong warehouse chỉ-append, chứng minh đã xoá
tools:
  - Retention policy
  - Right to erasure
  - Partition expiration
  - Crypto-shredding
  - Audit trail
weight: 3
---

Dữ liệu không phải càng giữ lâu càng tốt: tốn tiền, tăng rủi ro rò rỉ, và luật (GDPR, Nghị định 13/2023) yêu cầu xoá khi hết mục đích hoặc khi cá nhân yêu cầu.

## Retention policy

Mỗi lớp/bảng một chính sách, ghi thành văn bản và cấu hình tự động:

| Lớp | Giữ | Cơ chế |
|---|---|---|
| Raw / landing | 30–90 ngày (đủ để làm lại) | `partition_expiration_days`, lifecycle policy trên bucket |
| Staging | Bằng raw hoặc ngắn hơn | Như trên |
| Marts | Theo nghiệp vụ (tài chính: 5–10 năm) | Archive sang tầng lạnh sau N năm |
| Log, XCom, metadata Airflow | 30–90 ngày | Cron dọn |
| Dữ liệu cá nhân | Theo mục đích thu thập; xoá khi hết | Quy trình xoá riêng bên dưới |

## Xoá theo yêu cầu cá nhân

Khó vì dữ liệu nằm rải: raw, staging, marts, snapshot SCD, file Parquet trên lake, backup, Kafka topic, cache BI. Cần:

1. **Bản đồ PII**: cột nào ở bảng nào chứa dữ liệu cá nhân (tag trong catalog).
2. **Khoá định danh chung** để tìm mọi bản ghi của một người.
3. **Cơ chế xoá theo lớp**: warehouse → `DELETE`/`MERGE`; lake Iceberg/Delta → `DELETE` có ACID + compaction để file cũ thật sự mất; Parquet thuần → ghi lại partition; Kafka → tombstone trên topic compact hoặc chờ hết retention.
4. **Crypto-shredding** cho nơi không xoá được (backup, archive): mã hoá PII bằng khoá riêng mỗi người; xoá khoá = dữ liệu thành vô nghĩa.
5. **Audit trail**: ai yêu cầu, xoá ở đâu, lúc nào — để chứng minh khi bị hỏi.

## Sai lầm hay gặp

- "Xoá" chỉ ở bảng marts, còn raw và snapshot SCD vẫn giữ nguyên.
- Time travel / snapshot của warehouse giữ dữ liệu đã xoá thêm 7–90 ngày — phải tính vào cam kết.
- Không có retention cho bảng tạm và schema dev → dữ liệu cá nhân nằm trong `dbt_dev_*` hai năm.
