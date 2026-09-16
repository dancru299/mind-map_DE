---
title: Design doc & trade-off
tagline: Hai phương án trở lên, chọn một, nói rõ vì sao bỏ phương án kia
tools:
  - Design doc
  - Alternatives considered
  - Trade-off matrix
  - Reversibility
  - Review
weight: 4
---

Thiết kế không phải tìm "đáp án đúng" mà là **chọn có ý thức giữa các đánh đổi**. Design doc là nơi ghi lại lựa chọn đó để người khác review được và người sau hiểu được.

## Cấu trúc một trang

1. **Bối cảnh & mục tiêu** — 3 câu. Kèm SLA đã chốt.
2. **Ngoài phạm vi** — thứ cố tình không làm (tránh tranh cãi "sao không làm X").
3. **Phương án** — ít nhất 2, mỗi phương án 5–10 dòng: cách làm, ưu, nhược, chi phí, rủi ro.
4. **Ma trận đánh đổi** — các phương án × tiêu chí (freshness, chi phí, độ phức tạp vận hành, kỹ năng team có sẵn, khả năng đảo ngược). Điểm số thô là đủ.
5. **Đề xuất** và **vì sao không chọn phương án còn lại** — phần người review đọc kỹ nhất.
6. **Rủi ro & cách giảm**; **kế hoạch triển khai & rollback**; **câu hỏi mở**.

| Tiêu chí | A: dbt incremental mỗi giờ | B: Flink streaming | C: dbt mỗi ngày |
|---|---|---|---|
| Freshness (cần ≤ 2h) | 1h ✓ | 1 phút ✓✓ | 24h ✗ |
| Chi phí/tháng | ~$300 | ~$2.500 + 1 người | ~$60 |
| Team đã biết | ✓ | ✗ (phải học Flink) | ✓ |
| Đảo ngược được | Dễ | Khó | Dễ |
| **Chọn** | **✓** | Khi freshness < 15 phút | Không đạt SLA |

Trade-off hay gặp trong data: **tươi vs rẻ**, **đúng tuyệt đối vs kịp thời**, **linh hoạt (raw, JSON) vs dễ dùng (phẳng, typed)**, **managed (nhanh, lock-in) vs tự dựng (kiểm soát, tốn người)**, **chuẩn hoá (nhất quán) vs tốc độ giao hàng**.

## Cách luyện

- Design doc cho mọi việc > 1 tuần, gửi 2 người review, chốt trong 3 ngày. Không có phương án B thì chưa phải thiết kế.
- Sau 6 tháng đọc lại: dự đoán nào sai? Đó là bài học thật.

## Sai lầm hay gặp

- Chỉ có một phương án (cái mình thích) và các "phương án" khác là bù nhìn.
- Chọn theo tool mới hấp dẫn thay vì theo tiêu chí đã liệt kê.
- Review thành tranh luận style; tách review thiết kế khỏi review code.
