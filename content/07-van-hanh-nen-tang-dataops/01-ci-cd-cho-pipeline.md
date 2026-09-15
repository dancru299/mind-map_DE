---
title: CI/CD cho pipeline
tagline: Merge code là chạy test và deploy tự động
tools:
  - GitHub Actions
  - GitLab CI
  - sqlfluff
  - dbt Slim CI
  - pytest
  - Pre-commit
---

- Lint SQL (sqlfluff), lint Python, dbt compile & test trên schema tạm cho mỗi PR (Slim CI: chỉ chạy model đã đổi).
- Unit test cho logic Python; integration test với dữ liệu mẫu.
- Deploy DAG/dbt project qua GitHub Actions / GitLab CI, không copy tay lên server.
