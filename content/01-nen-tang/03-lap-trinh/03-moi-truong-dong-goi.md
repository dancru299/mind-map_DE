---
title: Môi trường & đóng gói
tagline: '"Trên máy tôi chạy được" không phải tiêu chuẩn'
tools:
  - venv / uv / poetry
  - requirements.txt / lock file
  - Docker
  - pyproject.toml
  - Pre-commit
weight: 3
---

Pipeline chạy trên Airflow worker, trên CI, trên máy đồng nghiệp — mỗi nơi một Python, một bộ thư viện. Đóng gói là cách bảo đảm cùng một code cho cùng một kết quả ở mọi nơi.

- **Môi trường ảo** cho mỗi project (`uv venv`, `python -m venv`, `poetry`). Không cài gì vào Python hệ thống.
- **Lock file** (`uv.lock`, `poetry.lock`, `requirements.txt` có version cố định): cài đúng phiên bản đã test, không "cài bản mới nhất" rồi vỡ vào thứ Hai.
- **`pyproject.toml`**: khai báo project, dependency, tool config (ruff, mypy, pytest) ở một chỗ.
- **Docker** khi môi trường phức tạp (Java cho Spark, driver DB): image build từ `Dockerfile` trong repo, CI và prod chạy cùng image.
- **Pre-commit hooks**: `ruff` (lint + format), `sqlfluff`, kiểm tra không commit secret — chạy trước mỗi commit, khỏi tranh cãi style trong review.

```toml
# pyproject.toml (rút gọn)
[project]
name = "orders-pipeline"
requires-python = ">=3.12"
dependencies = ["polars>=1.0", "google-cloud-bigquery>=3.20", "pydantic>=2.0"]

[tool.ruff]
line-length = 110

[tool.pytest.ini_options]
testpaths = ["tests"]
```

## Sai lầm hay gặp

- `pip install` thẳng trên Airflow worker prod để "sửa nhanh" → worker khác không có, deploy sau mất.
- Không pin version → thư viện nâng major, pipeline vỡ, mất nửa ngày mới biết vì sao.
- Docker image 4 GB vì cài cả `jupyter` và `tensorflow` vào image ETL.
