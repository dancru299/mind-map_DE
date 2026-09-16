---
title: Self-service & data literacy
tagline: 'Mục tiêu cuối: người dùng tự trả lời câu hỏi mà không cần hỏi DE'
tools:
  - Self-service BI
  - Data catalog
  - Certified dataset
  - Office hours
  - Data literacy
weight: 3
---

Team data không scale bằng cách trả lời nhiều câu hỏi hơn — mà bằng cách làm cho người khác tự trả lời được. Ba trụ:

**Dữ liệu tìm được và tin được**: catalog có mô tả, owner, freshness; một nhóm bảng "certified" (đã kiểm tra, có SLA) tách khỏi bảng thử nghiệm. Người dùng biết bảng nào được dùng cho báo cáo chính thức.

**Công cụ phù hợp từng người**: analyst → SQL trực tiếp trên marts + semantic layer; quản lý → dashboard có sẵn + explore trong giới hạn; người không kỹ thuật → hỏi bằng ngôn ngữ tự nhiên trên semantic layer (đang phổ biến). Không bắt mọi người học SQL.

**Dạy cách đọc số**: metric nghĩa là gì, mẫu số là gì, vì sao hai dashboard khác nhau, khi nào số "lạ" là bug và khi nào là thật. Office hours hằng tuần, tài liệu "10 câu hỏi hay gặp", một kênh hỏi đáp có lịch sử tìm được.

Đo lường: số câu hỏi ad-hoc gửi cho DE **giảm**, số người dùng tự query **tăng**, tỷ lệ query trên bảng certified tăng.

## Sai lầm hay gặp

- Mở toàn bộ warehouse cho mọi người "tự phục vụ" → 40 định nghĩa doanh thu, chi phí query bùng nổ.
- Self-service không có semantic layer → mỗi người tự join, tự tính, tự sai.
- Coi self-service là "để khỏi bị làm phiền" thay vì là sản phẩm cần thiết kế và hỗ trợ.
