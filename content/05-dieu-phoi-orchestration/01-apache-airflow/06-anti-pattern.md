---
title: Anti-pattern Airflow
tagline: Những lỗi gặp ở hầu hết deployment Airflow, và cách sửa
tools:
  - Top-level code
  - Idempotency
  - retries
  - SLA / alerting
  - Variable / Connection
---

| Anti-pattern | Triệu chứng | Sửa |
|---|---|---|
| **Code nặng ở top-level** file DAG (query DB, gọi API, đọc file lớn để build DAG) | Scheduler chậm, "DAG import timeout", UI treo | Đưa vào hàm của task; file DAG chỉ khai báo cấu trúc |
| `datetime.now()` trong task | Backfill sai, chạy lại cho kết quả khác | Dùng `data_interval_start/end` |
| Task không idempotent (INSERT append) | Retry/chạy lại → dữ liệu trùng | `INSERT OVERWRITE` partition, `MERGE`, xoá-rồi-ghi theo khoảng |
| `retries=0` | Lỗi mạng tạm thời làm DAG đỏ 3h sáng | `retries=2`, `retry_delay`, `retry_exponential_backoff=True` |
| Không có alert | Biết pipeline hỏng khi sếp hỏi | `on_failure_callback` → Slack; SLA miss callback |
| Secret hard-code trong DAG | Lộ credential trong Git | Airflow Connection / Secret backend (Secret Manager, Vault) |
| `Variable.get()` ở top-level | Mỗi lần parse là một query metadata DB | Đọc trong task, hoặc dùng Jinja `{{ var.value.x }}` |
| Xử lý dữ liệu bằng pandas trên worker | OOM, chậm, không scale | Đẩy sang warehouse/Spark; Airflow chỉ điều phối |
| DAG phụ thuộc DAG khác bằng `sleep` hoặc lịch lệch 30 phút | Upstream chậm là downstream đọc dữ liệu cũ | `ExternalTaskSensor`, hoặc Dataset/asset-aware scheduling |
| Một DAG 300 task | Không nhìn được, một task lỗi kéo tất cả | Tách theo domain; `TaskGroup` để gom nhìn |

```python
default_args = {
    "owner": "data-platform",
    "retries": 2,
    "retry_delay": timedelta(minutes=5),
    "retry_exponential_backoff": True,
    "on_failure_callback": notify_slack,     # gửi dag_id, task_id, logical_date, link log
    "sla": timedelta(hours=2),
}
```

## Sai lầm hay gặp

- Coi Airflow là nơi *xử lý* dữ liệu. Nó là nơi *ra lệnh* xử lý dữ liệu. Worker Airflow yếu là bình thường; công việc nặng phải chạy ở nơi khác.
- Không có môi trường dev/staging cho Airflow → test DAG bằng cách deploy lên prod và "tắt schedule".
- Không dọn XCom, log, run cũ → metadata DB phình sau một năm, UI chậm.
