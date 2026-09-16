---
title: Hiểu nghiệp vụ & metric
tagline: Không hiểu doanh thu tính thế nào thì không mô hình được bảng doanh thu
tools:
  - Revenue / GMV / Net revenue
  - Retention / Churn
  - Funnel / Conversion
  - Cohort
  - Metric definition
weight: 5
---

DE không cần là chuyên gia nghiệp vụ, nhưng phải hiểu **metric người ta hỏi được tính từ đâu** — vì grain, join, và SCD đều đi ra từ đó.

Bộ metric gặp ở hầu hết công ty:

| Nhóm | Metric | Câu hỏi DE phải hỏi |
|---|---|---|
| Doanh thu | GMV, doanh thu thuần (sau hoàn/huỷ/giảm giá), doanh thu ghi nhận (kế toán) | Thời điểm ghi nhận: đặt, thanh toán, giao, hay hết hạn hoàn? |
| Khách hàng | Active user (DAU/WAU/MAU), new vs returning, churn, retention theo cohort | "Active" = làm gì? Cohort theo ngày đăng ký hay ngày mua đầu? |
| Chuyển đổi | Funnel (xem → giỏ → thanh toán), conversion rate, CAC, LTV | Mẫu số là phiên, người, hay thiết bị? |
| Vận hành | Fill rate, thời gian giao, tỷ lệ huỷ, tồn kho | Snapshot lúc nào trong ngày? |
| Tài chính | Margin, chi phí theo kênh, ARPU | Phân bổ chi phí chung theo quy tắc nào? |

Mỗi metric có **định nghĩa, mẫu số, thời điểm, và ngoại lệ** — bốn thứ đó phải nằm trong docs của bảng, không nằm trong đầu một analyst.

Ngành khác có metric riêng (ngân hàng: NPL, CASA; bảo hiểm: loss ratio; logistics: on-time rate). Học 10 metric quan trọng nhất của công ty bạn trong tuần đầu.

## Cách luyện

- Xin ngồi nghe 2–3 buổi review số của bộ phận kinh doanh/tài chính. Ghi lại từ nào được dùng với nghĩa gì.
- Với mỗi bảng fact bạn làm, tự tính lại một metric bằng SQL và so với báo cáo hiện có. Lệch → đi hỏi, thường học được một ngoại lệ nghiệp vụ.

## Sai lầm hay gặp

- Nhận định nghĩa "doanh thu" từ analyst A, không biết analyst B và kế toán dùng định nghĩa khác.
- Mô hình bảng theo cấu trúc DB nguồn thay vì theo câu hỏi nghiệp vụ.
- Xem thường "logic nghiệp vụ lặt vặt" (đơn test, đơn nội bộ, khách hàng gộp) — chính chúng làm số lệch.
