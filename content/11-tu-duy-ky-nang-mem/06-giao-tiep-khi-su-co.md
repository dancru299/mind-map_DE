---
title: Giao tiếp khi sự cố
tagline: Báo sớm, nói rõ tác động, không đổ lỗi
tools:
  - Incident communication
  - Blameless postmortem
  - Impact statement
  - ETA
  - Status update
weight: 4
---

Dashboard sai số lúc 9h, họp ban giám đốc lúc 10h. Cách bạn giao tiếp trong 60 phút đó quyết định người ta nhớ gì về team data — nhiều hơn cả nguyên nhân sự cố.

Mẫu thông báo sự cố (gửi trong 15 phút đầu, chưa cần biết nguyên nhân):

> **Sự cố**: Doanh thu ngày 15/6 trên dashboard Finance đang thấp hơn thực tế.
> **Tác động**: Chỉ dashboard này, chỉ ngày 15/6. Các ngày khác và các báo cáo khác không ảnh hưởng.
> **Đang làm**: Đã xác định nguồn Shopify thiếu 2 giờ dữ liệu; đang backfill.
> **Cập nhật tiếp**: 10h30, hoặc sớm hơn nếu xong.

Nguyên tắc:

- **Báo trước khi bị hỏi.** Người dùng phát hiện trước bạn là mất niềm tin gấp đôi.
- **Tác động trước, nguyên nhân sau.** Người nhận cần biết "tôi có dùng số này được không", không cần biết binlog.
- **Không nói "lỗi nhỏ"** khi chưa biết phạm vi. Nói "đang xác định phạm vi".
- **Cập nhật đúng giờ đã hứa**, kể cả khi cập nhật là "chưa có gì mới".
- **Postmortem không đổ lỗi**: sự cố do hệ thống cho phép sai, không phải do người. Hỏi "vì sao hệ thống không chặn được" thay vì "ai làm".

## Cách luyện

- Viết sẵn mẫu thông báo và danh sách kênh/người cần báo cho từng pipeline quan trọng (trong runbook).
- Sau sự cố: viết postmortem 1 trang trong 48 giờ — dòng thời gian, nguyên nhân gốc, hành động cụ thể có người và hạn.

## Sai lầm hay gặp

- Im lặng sửa cho xong rồi mới báo — nếu không sửa xong kịp thì đã mất cả hai.
- Giải thích kỹ thuật cho người không kỹ thuật.
- Postmortem thành buổi tìm người chịu trách nhiệm → lần sau không ai báo sự cố sớm nữa.
