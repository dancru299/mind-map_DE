---
title: Pool, concurrency & priority
tagline: Không cho 200 task cùng đập vào một database
tools:
  - pool
  - max_active_tasks
  - max_active_runs
  - priority_weight
  - Executor (Celery / Kubernetes)
---

Airflow có nhiều nấc giới hạn song song; task chỉ chạy khi qua được tất cả:

| Nấc | Phạm vi | Đặt ở đâu |
|---|---|---|
| `parallelism` | Toàn hệ thống — tổng task chạy cùng lúc | `airflow.cfg` |
| `max_active_runs` | Số DAG run song song của một DAG | Tham số DAG |
| `max_active_tasks` | Số task song song trong một DAG run | Tham số DAG |
| **Pool** | Tài nguyên dùng chung giữa nhiều DAG (kết nối Postgres nguồn, API rate limit) | UI → Admin → Pools; task khai báo `pool=` |
| `priority_weight` | Task nào được lấy slot trước khi thiếu | Tham số task |

```python
extract = PythonOperator(
    task_id="extract_from_erp",
    python_callable=pull_erp,
    pool="erp_database",          # pool có 4 slot: tối đa 4 task trên toàn Airflow cùng đụng ERP
    pool_slots=1,
    priority_weight=10,           # cao hơn mặc định (1): pipeline doanh thu đi trước
)
```

Executor quyết định task chạy **ở đâu**: `LocalExecutor` (một máy), `CeleryExecutor` (đội worker cố định), `KubernetesExecutor` (mỗi task một pod, scale theo nhu cầu, khởi động chậm hơn). Managed (Composer, MWAA) chọn sẵn.

## Sai lầm hay gặp

- Không có pool cho DB nguồn → backfill 90 ngày tạo 90 task cùng query production DB, DBA gọi điện.
- `max_active_runs` mặc định 16 với DAG không idempotent → hai run cùng ghi một bảng.
- Tăng `parallelism` mà không tăng worker → task "queued" mãi.
- Task nhẹ (sensor, gọi API) và task nặng (Spark) dùng chung queue → task nhẹ chờ sau task nặng. Tách queue/pool.
