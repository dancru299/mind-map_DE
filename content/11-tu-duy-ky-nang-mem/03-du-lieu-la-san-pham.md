---
title: Dữ liệu là sản phẩm
tagline: Bảng có người dùng, có SLA, có owner, có docs — như một sản phẩm
tools:
  - Data product
  - Owner
  - SLA / SLO
  - Documentation
  - Deprecation
weight: 4
---

Pipeline "chạy được" chưa phải xong. Một bảng là sản phẩm khi người khác **tìm được, hiểu được, tin được, và biết ai chịu trách nhiệm**:

| Sản phẩm phần mềm | Sản phẩm dữ liệu |
|---|---|
| Người dùng | Analyst, DS, dashboard, hệ thống khác |
| Tính năng | Cột, grain, độ tươi |
| Docs / README | Description bảng & cột, grain, ví dụ query |
| SLA uptime | Sẵn sàng trước 7h, freshness < 1h |
| Owner / on-call | Team chịu trách nhiệm khi số sai |
| Versioning & deprecation | Đổi schema có thông báo; bảng cũ có ngày ngừng |
| Feedback | Kênh để người dùng báo số sai |

Khác biệt trong hành vi: DE "làm pipeline" xong là chuyển task; DE "làm sản phẩm" hỏi ai đang dùng, họ có hiểu không, có bảng nào nên gộp/bỏ.

## Cách luyện

- Mỗi bảng ở lớp marts: viết description một câu bắt đầu bằng "Một dòng = …", ghi owner, ghi SLA. Không có ba thứ đó thì chưa gọi là xong.
- Mỗi quý: nhìn lineage/usage, bảng không ai đọc 90 ngày → thông báo ngừng.

## Sai lầm hay gặp

- Tạo bảng theo từng yêu cầu lẻ → 40 bảng gần giống nhau, không ai biết bảng nào đúng.
- Đổi tên cột "cho đẹp" mà không biết 6 dashboard đang dùng.
- Coi docs là việc làm sau — sau không bao giờ tới.
