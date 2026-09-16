---
title: Dynamic DAG & DAG factory
tagline: 40 bảng nguồn, một mẫu — sinh DAG từ cấu hình thay vì copy file
tools:
  - DAG factory
  - YAML config
  - globals()
  - Dynamic task mapping
  - dag-factory
weight: 3
---

Khi có 40 bảng cần ingest theo cùng một mẫu (extract → load → test), copy 40 file DAG là nợ kỹ thuật: sửa một chỗ phải sửa 40 file. Thay bằng **một hàm sinh DAG** đọc cấu hình.

```python
# dags/ingest_factory.py
import yaml, pathlib
from airflow import DAG
from airflow.providers.google.cloud.transfers.postgres_to_gcs import PostgresToGCSOperator

CONFIG = yaml.safe_load(pathlib.Path(__file__).with_name("ingest_tables.yaml").read_text())
# ingest_tables.yaml:
#   - table: orders      schedule: "0 * * * *"   incremental_col: updated_at
#   - table: customers   schedule: "@daily"

def make_dag(cfg: dict) -> DAG:
    with DAG(dag_id=f"ingest_{cfg['table']}", schedule=cfg["schedule"], start_date=..., catchup=False,
             tags=["ingest", "factory"]) as dag:
        PostgresToGCSOperator(
            task_id="extract",
            sql=f"SELECT * FROM {cfg['table']} WHERE {cfg.get('incremental_col', '1')} >= '{{{{ data_interval_start }}}}'",
            bucket="raw", filename=f"{cfg['table']}/{{{{ ds }}}}/part.parquet", export_format="parquet",
        )
    return dag

for cfg in CONFIG:
    globals()[f"ingest_{cfg['table']}"] = make_dag(cfg)   # Airflow chỉ nhận DAG ở top-level của module
```

Hai loại "dynamic" khác nhau:

- **DAG factory** (trên): cấu trúc DAG cố định theo cấu hình, biết trước lúc parse. Ổn định, dễ debug.
- **Dynamic task mapping** (`expand`): số task quyết định lúc chạy theo dữ liệu. Dùng khi số việc thay đổi mỗi run.

Tránh: sinh DAG bằng cách **query database lúc parse** (`for t in query("SELECT table_name ...")`) — scheduler parse file mỗi 30 giây, mỗi lần một query, và DB sập là toàn bộ DAG biến mất.

## Sai lầm hay gặp

- Một DAG khổng lồ chứa 40 nhánh cho 40 bảng thay vì 40 DAG nhỏ → một bảng lỗi kéo cả DAG đỏ, không retry riêng, không lịch riêng.
- `dag_id` sinh từ cấu hình bị trùng (hai dòng cùng tên bảng) → DAG ghi đè nhau âm thầm.
- Cấu hình YAML không có schema/validation → lỗi chính tả `schedule` thành `schedual` chỉ phát hiện khi DAG không chạy.
