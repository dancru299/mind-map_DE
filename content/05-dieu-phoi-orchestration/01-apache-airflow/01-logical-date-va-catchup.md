---
title: logical_date, data interval & catchup
tagline: DAG chạy "cho ngày nào" khác "chạy lúc nào" — hiểu sai là backfill sai
tools:
  - logical_date
  - data_interval_start / end
  - catchup
  - start_date
  - "{{ ds }}"
---

Airflow không hỏi "bây giờ là mấy giờ" mà hỏi "**lần chạy này xử lý khoảng dữ liệu nào**". Mỗi DAG run có `data_interval_start` và `data_interval_end`; `logical_date` (tên cũ `execution_date`) = `data_interval_start`. Với lịch `@daily`, run cho ngày 2025-06-01 được **kích hoạt vào đầu ngày 2025-06-02** — sau khi khoảng dữ liệu đã kết thúc.

```python
from airflow.decorators import dag, task
import pendulum

@dag(
    schedule="@daily",
    start_date=pendulum.datetime(2025, 1, 1, tz="Asia/Ho_Chi_Minh"),
    catchup=False,            # True: tạo run cho mọi ngày từ start_date tới nay khi bật DAG
    max_active_runs=1,
)
def daily_orders():
    @task
    def load(data_interval_start=None, data_interval_end=None):
        # Tham số của lần chạy — dùng cái này, KHÔNG dùng datetime.now()
        sql = f"""
          INSERT OVERWRITE fct_orders PARTITION (order_date = '{data_interval_start:%Y-%m-%d}')
          SELECT ... FROM raw_orders
          WHERE ordered_at >= '{data_interval_start}' AND ordered_at < '{data_interval_end}'
        """
        run(sql)
    load()

daily_orders()
```

Trong template Jinja của operator: `{{ ds }}` (YYYY-MM-DD của logical_date), `{{ data_interval_start }}`, `{{ data_interval_end }}`.

## catchup

`catchup=True` (mặc định cũ): bật DAG có `start_date` từ 6 tháng trước → Airflow lập tức tạo 180 run. Đôi khi đúng ý (backfill có chủ đích), thường là tai nạn. Đặt `catchup=False` mặc định, backfill bằng tay: `airflow dags backfill -s 2025-01-01 -e 2025-01-31 daily_orders`.

## Sai lầm hay gặp

- `datetime.now()` / `CURRENT_DATE` trong task → chạy lại cho ngày cũ vẫn lấy dữ liệu hôm nay. Đây là lỗi số một của DAG mới.
- Tưởng run ngày 06-01 chạy vào ngày 06-01 → lệch một kỳ, dashboard "thiếu hôm nay".
- `start_date` động (`datetime.now()`) → scheduler không bao giờ chạy DAG.
- Đổi `schedule` hoặc `start_date` của DAG đang chạy → lịch sử run lệch; tạo DAG mới với tên mới nếu cần đổi lớn.
