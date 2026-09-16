---
title: Học liên tục & đọc code người khác
tagline: Ngành đổi nhanh; người giỏi có hệ thống để theo kịp mà không chạy theo mọi thứ
tools:
  - Reading source code
  - Changelog
  - Side project
  - Conference talks
  - Learning log
weight: 2
---

Mỗi năm có 20 tool mới "thay thế mọi thứ". Không thể học hết; cũng không nên bỏ qua hết. Cách phân loại:

- **Nền tảng** (SQL, modeling, hệ phân tán, viết): đầu tư sâu, đọc sách, làm lại nhiều lần.
- **Tool đang dùng ở công ty**: đọc changelog mỗi bản phát hành lớn, đọc source khi gặp lỗi lạ — hiểu tool sâu hơn 90% người dùng chỉ sau vài lần.
- **Tool mới nổi**: đọc một bài tổng quan, biết nó giải bài toán gì, để đó. Học thật khi có việc cần.

Cách học hiệu quả nhất cho DE là **đọc code và pipeline của người khác**: PR của đồng nghiệp senior, source của dbt-utils, DAG mẫu của Airflow, cách một open-source project tổ chức test. Bạn thấy pattern mà tài liệu không dạy.

Nguồn đáng theo dõi: blog kỹ thuật của các công ty data lớn (Netflix, Airbnb, Uber, Shopify), Data Engineering Weekly, changelog của dbt/Airflow/Iceberg, các talk tại Data Council / Data+AI Summit.

## Cách luyện

- Learning log: mỗi tuần một dòng "tuần này học được gì, từ đâu". Sau 6 tháng nhìn lại thấy rõ mình đi đâu.
- Mỗi tháng đọc kỹ một PR không phải của mình trong repo công ty, ghi 3 điều học được.
- Side project nhỏ với dữ liệu công khai (giao thông, thời tiết, chứng khoán) để thử tool mới mà không rủi ro.

## Sai lầm hay gặp

- Học tool mới bằng cách đưa nó vào production công ty.
- Sưu tầm khoá học, không làm hết khoá nào.
- Chỉ đọc, không viết lại bằng lời mình — kiến thức không ở lại.
