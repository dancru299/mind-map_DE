---
title: Quản lý secret & truy cập hạ tầng
tagline: Không credential nào trong code, không quyền nào rộng hơn cần thiết
tools:
  - Secret Manager / Vault
  - Service account
  - Least privilege
  - Workload identity
  - Key rotation
weight: 3
---

Pipeline cần mật khẩu DB, API key, service account — và chúng có xu hướng rơi vào code, log, XCom, Slack. Quy tắc:

- **Secret ở một nơi**: Secret Manager (GCP), Secrets Manager (AWS), Key Vault (Azure), HashiCorp Vault. Airflow đọc qua secret backend; dbt đọc qua biến môi trường được CI/Airflow bơm vào lúc chạy.
- **Không có secret trong**: Git (kể cả branch cũ), file `.env` commit nhầm, log (`print(config)`), XCom, description của DAG, docs. Pre-commit hook `detect-secrets`/`gitleaks` chặn trước khi commit.
- **Service account riêng cho mỗi pipeline/mục đích**, không dùng chung một tài khoản "data-admin" cho tất cả. Khi lộ, phạm vi thiệt hại nhỏ và biết lộ từ đâu.
- **Least privilege**: pipeline ingest chỉ được ghi vào dataset raw; dbt chỉ được đọc raw, ghi staging/marts; BI chỉ được đọc marts. Không có `Owner`/`Editor` cấp project cho pipeline.
- **Workload identity / IAM role thay vì file key**: pod Kubernetes, Cloud Run, Composer nhận danh tính từ nền tảng — không có file JSON key để mà lộ. Nếu buộc dùng key: xoay vòng định kỳ, có ngày hết hạn.
- **Người ≠ máy**: người truy cập bằng SSO + MFA, quyền theo nhóm; máy bằng service account. Không ai dùng service account để chạy query tay.
- **Audit log** bật cho warehouse và bucket: ai đọc bảng nào lúc nào — cần khi điều tra rò rỉ hoặc bị hỏi tuân thủ.

```yaml
# Airflow: Connection lấy từ Secret Manager, không nằm trong metadata DB
# airflow.cfg
[secrets]
backend = airflow.providers.google.cloud.secrets.secret_manager.CloudSecretManagerBackend
backend_kwargs = {"connections_prefix": "airflow-connections", "variables_prefix": "airflow-variables"}
```

## Sai lầm hay gặp

- Key JSON của service account nằm trong repo "private" — private repo vẫn bị clone về laptop, laptop bị mất.
- Một service account `Editor` toàn project dùng cho 30 DAG → không thu hồi được khi lộ mà không dừng tất cả.
- Secret lộ trong log lỗi (`requests` in cả URL có token). Che secret trước khi log.
