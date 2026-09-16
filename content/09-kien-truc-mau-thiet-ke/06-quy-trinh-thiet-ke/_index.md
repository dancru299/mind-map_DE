---
title: Quy trình thiết kế hệ thống dữ liệu
tagline: Từ yêu cầu mơ hồ đến thiết kế có thể bảo vệ được — theo thứ tự
tools:
  - System design
  - Requirements
  - Back-of-envelope
  - Trade-off
  - Failure mode
---

Mẫu kiến trúc (Lambda, Kappa, Modern Data Stack…) là *kết quả*. Nhánh này là *cách đi tới kết quả đó*: một quy trình 5 bước dùng được cho pipeline nhỏ lẫn nền tảng lớn, và cũng chính là khung trả lời phỏng vấn system design cho DE.

1. **Thu thập yêu cầu → SLA**: ai dùng, dùng để làm gì, đúng tới đâu, trễ bao lâu, giữ bao lâu.
2. **Ước lượng quy mô**: bao nhiêu dòng/ngày, bao nhiêu GB/năm, bao nhiêu query/giờ — bằng phép tính nhẩm.
3. **Design doc & trade-off**: 2–3 phương án, chọn một, nói rõ vì sao không chọn các phương án kia.
4. **Failure mode & recovery**: cái gì hỏng, phát hiện thế nào, khôi phục thế nào, mất gì.
5. **Migration**: đưa thiết kế mới vào mà không dừng hệ thống cũ.

Người mới thường nhảy thẳng tới bước 3 (chọn tool). Người giỏi dành 60% thời gian cho bước 1–2 — vì thiết kế đúng cho yêu cầu sai là lãng phí đắt nhất.
