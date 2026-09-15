---
title: Vận hành & nền tảng (DataOps)
tagline: Đưa kỷ luật software engineering vào data
tools:
  - CI/CD
  - Terraform
  - Kubernetes
  - Monitoring
  - FinOps
  - On-call
bigtech: >-
  Big tech: platform team riêng, DE chỉ dùng. Công ty thường: DE kiêm luôn platform — dựng Airflow,
  tune warehouse, viết Terraform, chịu on-call.
---

Pipeline là phần mềm: có version control, test, CI/CD, môi trường dev/prod, monitoring, on-call. Đây là nơi Dev chuyển sang DE có lợi thế lớn nhất — nhiều team data còn chưa có những thứ này.

Platform engineering trong data: xây nền (orchestrator, warehouse, catalog, CI) để các DE và analyst khác đứng lên.
