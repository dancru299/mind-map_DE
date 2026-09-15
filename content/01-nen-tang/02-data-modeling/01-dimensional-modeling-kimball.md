---
title: Dimensional modeling (Kimball)
tagline: Fact + Dimension, star schema — chuẩn mặc định cho analytics
tools:
  - Fact table
  - Dimension
  - Grain
  - Star schema
  - Surrogate key
  - Conformed dimension
---

Bảng fact chứa số đo (doanh thu, số lượng) ở một grain xác định (mỗi dòng = một đơn hàng?). Bảng dimension chứa ngữ cảnh (khách hàng, sản phẩm, ngày).

Câu hỏi đầu tiên luôn là: grain của bảng fact này là gì? Trả lời sai câu này là nguồn của phần lớn bug tính toán trùng.

- Star schema: fact ở giữa, dimension xung quanh, join 1 tầng.
- Snowflake schema: dimension chuẩn hoá thêm — ít dùng vì join nhiều.
- Conformed dimension: một dim (vd dim_date) dùng chung cho nhiều fact.
