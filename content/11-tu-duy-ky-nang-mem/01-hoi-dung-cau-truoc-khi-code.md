---
title: Hỏi đúng câu trước khi code
tagline: '"Số này để ra quyết định gì?" — câu hỏi tiết kiệm nhiều tuần nhất'
tools:
  - Requirements
  - "5 Whys"
  - Definition of done
  - Acceptance criteria
weight: 5
---

Yêu cầu đến dưới dạng giải pháp: "làm cho tôi bảng doanh thu theo ngày". Người mới đi làm bảng. Người giỏi hỏi trước:

- **Để làm gì?** Quyết định nào sẽ được ra từ số này? Nếu không có quyết định → có thể không cần làm.
- **Định nghĩa là gì?** "Doanh thu" gồm VAT không? Trước hay sau hoàn tiền? Ngày đặt hay ngày thanh toán? Mỗi câu là một nhánh logic khác nhau.
- **Đúng đến mức nào là đủ?** Sai 0,1% có chấp nhận được không? Trễ 1 giờ có sao không? Câu trả lời quyết định batch hay streaming, test tới đâu.
- **Ai dùng, dùng thế nào, bao lâu một lần?** Dashboard mở mỗi sáng khác API gọi 1.000 lần/phút.
- **Đã có cái gì gần giống chưa?** Rất thường có — và tạo bảng thứ hai cho cùng một thứ là bắt đầu của "3 con số doanh thu khác nhau".
- **Làm xong trông như thế nào?** Chốt tiêu chí nghiệm thu trước khi bắt đầu.

Kỹ thuật *5 Whys*: hỏi "vì sao cần" năm lần, thường tới lần thứ ba là ra bài toán thật — và nó khác bài toán được giao.

## Cách luyện

- Với mọi yêu cầu, viết lại bằng một câu: "Người X cần biết Y để quyết định Z, với độ chính xác A và độ trễ B." Gửi lại người yêu cầu xác nhận trước khi code.
- Giữ một file "định nghĩa metric" của team; mỗi lần gặp một từ mơ hồ (active user, đơn hàng thành công) thì thêm vào.

## Sai lầm hay gặp

- Sợ hỏi vì "hỏi nhiều là kém" — thực tế ngược lại: người không hỏi làm sai và làm lại.
- Hỏi qua chat từng câu một trong 3 ngày thay vì một cuộc gọi 20 phút với danh sách câu hỏi chuẩn bị sẵn.
- Nhận yêu cầu từ người trung gian mà không gặp người dùng cuối.
