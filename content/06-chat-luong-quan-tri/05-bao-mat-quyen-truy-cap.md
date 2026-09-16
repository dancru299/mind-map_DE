---
title: Bảo mật & quyền truy cập
tagline: RBAC, che dữ liệu nhạy cảm, tuân thủ
tools:
  - RBAC
  - IAM
  - Column masking
  - Row-level security
  - PII
  - Encryption
  - Audit log
  - Nghị định 13
bigtech: >-
  Tập đoàn lớn ngoài tech (ngân hàng, bảo hiểm, tập đoàn đa ngành): bảo mật và tuân thủ chiếm phần
  lớn thời gian thiết kế. Startup: thường bị bỏ qua tới khi cần chứng chỉ hoặc bị audit.
weight: 4
---

- RBAC: ai được đọc dataset nào; nhóm theo vai trò thay vì cấp lẻ từng người.
- Column-level security / masking: cột PII (số điện thoại, CMND) chỉ vai trò được phép mới thấy rõ.
- Row-level security: mỗi chi nhánh chỉ thấy dữ liệu của mình.
- Encryption at rest / in transit, audit log, và không bao giờ hard-code credential.
- Tuân thủ: GDPR (EU), Nghị định 13/2023 về dữ liệu cá nhân (Việt Nam), yêu cầu xoá dữ liệu khi khách hàng yêu cầu.
