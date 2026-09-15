---
title: Slim CI & anti-pattern dbt
tagline: Chỉ chạy model đã đổi trong PR, và những lỗi thấy ở hầu hết project
tools:
  - state:modified+
  - --defer
  - manifest.json
  - dbt build
  - sqlfluff
---

## Slim CI

Project 300 model mà mỗi PR chạy lại tất cả thì CI mất 40 phút và tốn tiền warehouse. Slim CI: so `manifest.json` của PR với manifest của prod, chỉ chạy model **đã đổi và những gì phụ thuộc vào nó**, các model khác đọc từ prod (`--defer`).

```bash
# Trong CI, sau khi tải manifest.json của prod về thư mục prod-artifacts/
dbt build --select state:modified+ --defer --state prod-artifacts/ --target ci
# --target ci: ghi vào schema riêng của PR (vd dbt_ci_pr_123), xoá sau khi merge
```

Kèm `sqlfluff lint` để ép style (chữ hoa keyword, thụt lề, alias rõ) — tranh cãi style trong review là lãng phí thời gian.

## Anti-pattern thường thấy

| Anti-pattern | Hậu quả | Thay bằng |
|---|---|---|
| `SELECT *` xuyên suốt từ staging tới mart | Cột thừa, đổi nguồn là mart đổi theo, tốn byte quét | Liệt kê cột ở staging; `SELECT *` chỉ trong CTE nội bộ |
| Model 800 dòng, 15 CTE | Không test được từng bước, không ai dám sửa | Tách thành intermediate model |
| Logic nghiệp vụ lặp ở 5 mart (định nghĩa "khách hàng active") | 5 con số khác nhau | Một intermediate/dim, hoặc metric ở semantic layer |
| Không có `description` cho model/cột | Analyst đoán nghĩa, hỏi DE mỗi ngày | Bắt buộc description cho marts qua CI (`dbt-checkpoint`) |
| Chạy `dbt run` bằng tay trên laptop vào prod | Không có lịch sử, không có review | Airflow/Dagster/dbt Cloud chạy theo lịch, laptop chỉ chạy dev |
| Mọi model đều `table` full refresh mỗi giờ | Hoá đơn warehouse tăng theo số model | Staging = view, incremental cho bảng lớn |

## Sai lầm hay gặp

- Slim CI so với manifest **cũ** (quên cập nhật sau mỗi deploy prod) → chạy thừa hoặc thiếu model. Lưu manifest như artifact của job deploy prod.
- Schema CI không được dọn → warehouse đầy schema `dbt_ci_pr_*` rác.
