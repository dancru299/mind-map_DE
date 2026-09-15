---
title: Apache Airflow
tagline: Chuẩn phổ biến nhất — DAG viết bằng Python
tools:
  - DAG
  - Operator
  - Sensor
  - XCom
  - Scheduler
  - logical_date
  - catchup
  - Composer
  - MWAA
---

- DAG: file Python định nghĩa task và phụ thuộc. Scheduler quét, tạo DAG run theo lịch.
- Operator: một task làm một việc (BashOperator, PythonOperator, BigQueryInsertJobOperator…).
- Sensor: task đợi điều kiện (file đến, bảng có dữ liệu).
- XCom: truyền dữ liệu nhỏ giữa task — không dùng cho dữ liệu lớn.
- Executor: Local / Celery / Kubernetes — quyết định task chạy ở đâu.
- Managed: Cloud Composer, MWAA, Astronomer.

Lỗi kinh điển: logic nặng chạy trong file DAG (scheduler chậm), không set catchup, dùng datetime.now() thay vì logical_date.
