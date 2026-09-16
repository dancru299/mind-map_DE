---
title: Làm việc với analyst, DS và team app
tagline: Ba "khách hàng" với ba kỳ vọng khác nhau về cùng một dữ liệu
tools:
  - Stakeholder
  - Data contract
  - Self-service
  - Handoff
  - Office hours
weight: 4
---

| Team | Họ cần từ DE | Họ hay làm DE khổ | Cách làm việc tốt |
|---|---|---|---|
| **Analyst / BI** | Bảng sạch, đúng grain, có docs, tươi đúng giờ | Query trực tiếp raw, tự tạo bảng trùng, hỏi ad-hoc liên tục | Lớp marts rõ ràng; office hours cố định; dạy họ dùng lineage/docs |
| **Data Scientist** | Dữ liệu lịch sử đầy đủ, point-in-time đúng, feature nhất quán | Đòi "tất cả dữ liệu", notebook chạy query 5 TB, model dùng bảng không ai bảo trì | Thoả thuận feature store / bảng ML riêng có owner; giới hạn chi phí query |
| **Team app (upstream)** | Không bị DE làm chậm DB | Đổi schema không báo, xoá cột, "sửa nhanh" dữ liệu trong DB | Data contract; CDC thay vì query trực tiếp; được mời vào review PR đổi schema |
| **Quản lý / business** | Số đúng, đúng giờ, giải thích được | Yêu cầu bằng giải pháp, đổi định nghĩa giữa chừng | Viết lại yêu cầu thành một câu; chốt định nghĩa metric bằng văn bản |

Nguyên tắc chung: **nói bằng ngôn ngữ của họ** (analyst: bảng và cột; DS: feature và leakage; app: schema và migration; business: quyết định và rủi ro), và **đưa họ vào sớm** (review design doc) thay vì giao kết quả cuối.

## Cách luyện

- Đặt lịch office hours 1 giờ/tuần thay vì trả lời chat rải rác — giảm gián đoạn, tăng chất lượng câu hỏi.
- Mỗi quý gặp riêng một người của mỗi team, hỏi: "Điều gì về dữ liệu làm bạn mất thời gian nhất?"

## Sai lầm hay gặp

- Coi analyst là "người dùng cuối" thay vì đồng nghiệp — họ thường biết nghiệp vụ hơn bạn.
- Chặn team app đổi schema thay vì thiết lập quy trình để họ đổi an toàn.
- Nói "không" mà không đưa phương án thay thế.
