---
title: TaskFlow API & XCom
tagline: Truyền dữ liệu nhỏ giữa task — và vì sao không truyền dữ liệu lớn
tools:
  - "@task"
  - XCom
  - xcom_push / xcom_pull
  - Custom XCom backend
  - Dynamic task mapping
---

**XCom** (cross-communication) là cơ chế task để lại một giá trị nhỏ trong metadata DB cho task khác đọc: tên file vừa tạo, số dòng, ngày cần xử lý. Nó lưu trong Postgres của Airflow — **không phải kênh truyền dữ liệu**.

TaskFlow API (`@task`) làm XCom gần như vô hình: giá trị return của hàm tự thành XCom, tham số hàm tự kéo XCom về.

```python
from airflow.decorators import dag, task

@dag(schedule="@daily", start_date=..., catchup=False)
def partner_files():
    @task
    def list_files(data_interval_start=None) -> list[str]:
        return gcs_list(f"inbox/{data_interval_start:%Y-%m-%d}/")     # vài chục chuỗi — OK cho XCom

    @task
    def load_one(path: str) -> int:
        return bq_load(path)                                            # trả về số dòng

    @task
    def report(row_counts: list[int]):
        log.info("tổng %s dòng", sum(row_counts))

    counts = load_one.expand(path=list_files())    # dynamic task mapping: 1 task cho mỗi file
    report(counts)

partner_files()
```

`expand()` (dynamic task mapping) tạo số task theo dữ liệu lúc chạy — thay cho vòng `for` sinh task lúc parse.

## Sai lầm hay gặp

- Return một DataFrame từ `@task` → pickle cả DataFrame vào metadata DB; DB phình, scheduler chậm. Ghi ra GCS/S3, return đường dẫn. Hoặc cấu hình custom XCom backend lưu object lớn ra object storage.
- Dùng XCom để "cache" kết quả query giữa các ngày → XCom gắn với từng run, không phải kho lưu trữ.
- Task phụ thuộc vào XCom của run trước (`include_prior_dates`) → run độc lập không còn độc lập, backfill sai.
