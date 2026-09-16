---
title: Python cho DE
tagline: Không phải Python "làm được", mà Python đọc được, test được, chạy được ở nơi khác
tools:
  - Type hints
  - Generator
  - dataclass / pydantic
  - logging
  - pathlib
  - Context manager
weight: 5
---

Python trong DE là glue code: gọi API, đọc file, đẩy vào warehouse, xử lý lỗi. Vài thói quen tách code "chạy được" khỏi code "bảo trì được":

```python
from dataclasses import dataclass
from datetime import date
from typing import Iterator
import logging

log = logging.getLogger(__name__)

@dataclass(frozen=True)
class Order:                      # kiểu rõ ràng thay vì dict lồng dict
    order_id: str
    customer_id: str
    amount: float
    ordered_on: date

def fetch_orders(day: date, page_size: int = 500) -> Iterator[Order]:
    """Generator: trả từng dòng, không giữ cả triệu dòng trong RAM."""
    page = 0
    while True:
        rows = api.get("/orders", params={"date": day.isoformat(), "page": page, "size": page_size})
        if not rows: return
        for r in rows:
            yield Order(r["id"], r["customer_id"], float(r["amount"]), date.fromisoformat(r["created_at"][:10]))
        page += 1
        log.info("orders: đã lấy trang %s (%s dòng)", page, len(rows))
```

- **Type hints** ở mọi hàm public: IDE bắt lỗi trước khi chạy, người đọc biết hàm nhận gì trả gì. `mypy --strict` trong CI nếu team chịu được.
- **Generator / iterator** cho dữ liệu lớn: xử lý theo dòng hoặc batch, không `list()` cả tập.
- **`logging` thay `print`**: có level, có timestamp, tắt/bật được, đi vào log tập trung.
- **Không nuốt lỗi**: `except Exception: pass` là bug tương lai. Bắt lỗi cụ thể, log đầy đủ, re-raise hoặc fail rõ.
- **Cấu hình qua biến môi trường / file**, không hard-code; secret không bao giờ nằm trong code.
- **Idempotent và có thể chạy lại** theo tham số ngày — giống mọi pipeline.

Khi cần hiệu năng: `polars`/`pyarrow` thay `pandas` cho dữ liệu vừa; đẩy việc nặng sang SQL/Spark thay vì tối ưu vòng lặp Python.

## Sai lầm hay gặp

- Một file `etl.py` 800 dòng với mọi thứ ở top-level → không test được, không import được.
- `pandas` cho mọi việc, kể cả 50 GB → OOM. Kiểm tra kích thước trước khi chọn công cụ.
- Xử lý datetime bằng string thay vì kiểu `datetime` có múi giờ.
