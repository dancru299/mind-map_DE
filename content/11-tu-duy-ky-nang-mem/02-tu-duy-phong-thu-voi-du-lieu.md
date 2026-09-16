---
title: Tư duy phòng thủ với dữ liệu
tagline: Giả định mọi nguồn sẽ sai, rồi thiết kế để phát hiện được
tools:
  - Reconciliation
  - Sanity check
  - Assertion
  - Fail loudly
  - Trust but verify
weight: 5
---

Trong app, bug thường crash. Trong data, bug **trả về một con số** — hợp lý vừa đủ để không ai nghi ngờ, cho tới khi quyết định sai đã được ra. Vì vậy DE giỏi làm việc với giả định ngược: *dữ liệu này sai, tôi phải chứng minh nó đúng.*

Các thói quen cụ thể:

- **Đếm trước, đếm sau.** Mỗi bước biến đổi: số dòng vào, số dòng ra, giải thích được chênh lệch. Join làm số dòng tăng mà bạn không dự tính → dừng.
- **Đối chiếu với nguồn sự thật độc lập.** Tổng doanh thu trong warehouse phải khớp báo cáo kế toán ±x%. Số đơn phải khớp dashboard của app team. Đặt việc đối chiếu này thành test tự động.
- **Nghi ngờ số đẹp.** Đúng 1.000.000? Tăng đúng 100%? Null rate đúng 0% ở cột luôn có null? Thường là bug.
- **Nghi ngờ số ổn định bất thường.** Dashboard phẳng lì 3 ngày thường là pipeline đứng, không phải business đứng.
- **Fail loudly.** Thà pipeline đỏ và dashboard trống còn hơn dashboard hiện số cũ/sai mà không ai biết. Không bao giờ `try/except: pass`.
- **Kiểm tra "boundary"**: ngày đầu tháng, giao thừa múi giờ, năm nhuận, đơn hàng bị huỷ rồi khôi phục, khách hàng gộp tài khoản.

## Cách luyện

- Trước khi gửi bất kỳ con số nào, tự hỏi: "Nếu số này sai, tôi sẽ phát hiện bằng cách nào?" Nếu câu trả lời là "không" → thêm một kiểm tra.
- Sau mỗi sự cố dữ liệu, thêm một test đúng loại đã bỏ sót.

## Sai lầm hay gặp

- Tin tài liệu của hệ thống nguồn thay vì nhìn dữ liệu thật (`SELECT DISTINCT status` luôn có giá trị không có trong docs).
- Kiểm tra kỹ lúc build, không kiểm tra gì lúc chạy hằng ngày.
- Bỏ qua cảnh báo "nhỏ" (null rate tăng 2%) cho tới khi nó thành lớn.
