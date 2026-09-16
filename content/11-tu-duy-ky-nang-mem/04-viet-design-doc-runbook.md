---
title: "Viết: design doc, runbook, PR"
tagline: Viết được là nghĩ được — và người khác làm theo được lúc 3h sáng
tools:
  - Design doc
  - Runbook
  - ADR
  - PR description
  - RFC
weight: 4
---

DE làm việc với nhiều người không ngồi cạnh: team app, analyst, người trực đêm, chính bạn 6 tháng sau. Viết là cách duy nhất để tri thức tồn tại ngoài đầu bạn.

Bốn loại văn bản cần viết được:

**Design doc** (trước khi xây thứ tốn hơn 1 tuần): Bối cảnh & mục tiêu → Không nằm trong phạm vi → Yêu cầu (SLA, quy mô) → Thiết kế đề xuất → Phương án đã cân nhắc và vì sao không chọn → Rủi ro → Kế hoạch triển khai & rollback. Một trang là đủ; mục "phương án không chọn" là phần giá trị nhất.

**Runbook** (cho mỗi pipeline quan trọng): Pipeline này làm gì · dấu hiệu hỏng · cách kiểm tra nhanh · cách sửa các lỗi đã gặp · cách chạy lại/backfill · ai cần được báo. Viết cho người **không phải bạn** đọc lúc mệt.

**PR description**: Vì sao đổi · đổi gì · ảnh hưởng dữ liệu (bảng nào, cần backfill không) · cách đã kiểm tra · cần full refresh không. Reviewer không phải đoán.

**ADR** (Architecture Decision Record): mỗi quyết định lớn một trang — bối cảnh, quyết định, hệ quả. Sau 1 năm không ai nhớ vì sao chọn Airflow thay Dagster; ADR nhớ.

## Cách luyện

- Design doc cho việc tiếp theo dù nhỏ, gửi một người đọc trước khi code. Sửa theo góp ý — đó là review rẻ nhất.
- Sau mỗi lần trực sự cố, cập nhật runbook ngay, kể cả một dòng.

## Sai lầm hay gặp

- Viết dài để "đầy đủ" — không ai đọc. Một trang, có tiêu đề rõ, có bảng.
- Design doc viết **sau** khi code xong để hợp thức hoá.
- Runbook nói "kiểm tra log" mà không nói log ở đâu, tìm dòng nào.
