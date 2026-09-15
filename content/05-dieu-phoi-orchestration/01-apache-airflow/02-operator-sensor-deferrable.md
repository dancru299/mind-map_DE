---
title: Operator, Sensor & deferrable
tagline: Task làm việc, task chờ đợi, và cách chờ mà không chiếm worker
tools:
  - PythonOperator / @task
  - BashOperator
  - BigQueryInsertJobOperator
  - Sensor
  - mode="reschedule"
  - Deferrable / Triggerer
---

## Operator — task làm một việc

Provider packages có operator cho hầu hết dịch vụ (`apache-airflow-providers-google`, `-amazon`, `-dbt-cloud`…). Nguyên tắc: **để warehouse/engine làm việc nặng**, Airflow chỉ điều phối. `BigQueryInsertJobOperator` gửi SQL cho BigQuery chạy; đừng kéo 10 triệu dòng về worker bằng `PythonOperator` rồi xử lý bằng pandas.

```python
from airflow.providers.google.cloud.operators.bigquery import BigQueryInsertJobOperator

build_mart = BigQueryInsertJobOperator(
    task_id="build_fct_orders",
    configuration={"query": {"query": "{% include 'sql/fct_orders.sql' %}", "useLegacySql": False}},
    params={"lookback_days": 3},
)
```

## Sensor — task chờ điều kiện

Chờ file tới SFTP, chờ partition xuất hiện, chờ DAG khác xong (`ExternalTaskSensor`). Ba chế độ chờ:

| Mode | Cách chờ | Chi phí |
|---|---|---|
| `poke` (mặc định) | Giữ worker slot, kiểm tra mỗi `poke_interval` | Chiếm 1 slot suốt thời gian chờ |
| `reschedule` | Nhả slot, xếp lịch kiểm tra lại | Rẻ, nhưng độ trễ = `poke_interval` |
| **Deferrable** (`deferrable=True`) | Chuyển việc chờ sang tiến trình Triggerer (async) | Gần như miễn phí, hàng nghìn sensor cùng lúc |

```python
from airflow.providers.google.cloud.sensors.gcs import GCSObjectExistenceSensor

wait_file = GCSObjectExistenceSensor(
    task_id="wait_partner_file",
    bucket="partner-inbox", object="orders/{{ ds }}/orders.csv",
    deferrable=True, timeout=6 * 3600,   # bỏ cuộc sau 6 giờ, fail rõ ràng
)
```

## Sai lầm hay gặp

- 50 sensor `poke` cùng lúc chiếm hết worker → task thật không có chỗ chạy, cả hệ thống "treo".
- Sensor không có `timeout` → chờ mãi, không ai biết file không tới.
- Logic Python nặng trong `PythonOperator` chạy trên worker của Airflow (RAM nhỏ) → OOM. Đẩy sang BigQuery/Spark/Kubernetes pod.
