---
title: Monitoring, alerting & on-call
tagline: Biết pipeline hỏng trước khi người dùng biết
tools:
  - Prometheus
  - Grafana
  - PagerDuty
  - Slack alert
  - Runbook
  - Postmortem
  - SLO
---

Giám sát ba lớp: hạ tầng (Airflow scheduler sống không), pipeline (task fail, chạy quá lâu), dữ liệu (freshness, volume). Cảnh báo về Slack/PagerDuty với đủ ngữ cảnh để hành động.

Runbook cho mỗi loại sự cố; postmortem không đổ lỗi sau sự cố lớn.
