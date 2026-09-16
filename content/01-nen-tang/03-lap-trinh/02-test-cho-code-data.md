---
title: Viết test cho code data
tagline: Unit test cho logic, test với dữ liệu mẫu cho pipeline, test dữ liệu cho kết quả
tools:
  - pytest
  - Fixture
  - Sample data
  - dbt unit test
  - Golden dataset
weight: 4
---

Ba tầng test, mỗi tầng bắt một loại lỗi:

| Tầng | Kiểm cái gì | Công cụ | Chạy khi |
|---|---|---|---|
| **Unit test** | Hàm biến đổi thuần: parse ngày, tính phí, chuẩn hoá tên | `pytest`, không cần DB | Mỗi commit, vài giây |
| **Test pipeline với dữ liệu mẫu** | Model dbt / job Spark cho ra đúng kết quả với input nhỏ đã biết trước | dbt unit test (≥ 1.8), Spark local với fixture, DuckDB thay warehouse | Mỗi PR |
| **Test dữ liệu thật** | Kết quả trong warehouse thoả điều kiện (unique, freshness, đối chiếu) | dbt test, Great Expectations | Mỗi lần chạy pipeline |

```python
# tests/test_transform.py — logic thuần, không đụng warehouse
from decimal import Decimal
from etl.transform import net_amount

def test_net_amount_tru_hoan_va_giam_gia():
    assert net_amount(gross=Decimal("100"), refund=Decimal("30"), discount=Decimal("10")) == Decimal("60")

def test_net_amount_khong_am():
    assert net_amount(gross=Decimal("10"), refund=Decimal("30"), discount=Decimal("0")) == Decimal("0")
```

```yaml
# dbt unit test: cho input giả, kiểm output — chạy không cần dữ liệu thật
unit_tests:
  - name: fct_orders_tinh_net_amount
    model: fct_orders
    given:
      - input: ref('stg_orders')
        rows: [{order_id: 1, gross: 100, refund: 30, discount: 10}]
    expect:
      rows: [{order_id: 1, net_amount: 60}]
```

Nguyên tắc: **tách logic khỏi I/O** để test được. Hàm nhận DataFrame/dict trả DataFrame/dict; việc đọc/ghi ở lớp ngoài.

## Sai lầm hay gặp

- Test bằng cách chạy pipeline trên prod rồi "nhìn thấy ổn".
- Fixture dữ liệu mẫu copy từ prod có PII → lộ dữ liệu trong repo. Tự sinh dữ liệu giả.
- Chỉ test happy path; bug nằm ở null, chuỗi rỗng, ngày 29/2, số âm, unicode.
