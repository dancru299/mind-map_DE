---
title: Ưu tiên & nợ kỹ thuật
tagline: '"Đủ tốt" là một kỹ năng, không phải sự lười'
tools:
  - Tech debt
  - Reversible vs irreversible
  - MVP
  - Cost of delay
  - Refactor
weight: 4
---

Danh sách việc luôn dài hơn thời gian. DE giỏi không làm nhanh hơn — họ **chọn đúng việc** và **chọn đúng mức hoàn thiện** cho từng việc.

Khung quyết định:

- **Quyết định đảo ngược được** (tên cột, materialization, lịch chạy) → làm nhanh, sửa sau. **Không đảo ngược được** (grain bảng fact, chọn warehouse, format lưu trữ) → dừng lại, viết design doc, hỏi.
- **Cost of delay**: việc này chậm 1 tuần thì mất gì? Dashboard CEO chậm khác báo cáo nội bộ chậm.
- **Nợ kỹ thuật có chủ đích** ≠ cẩu thả. Vay nợ được khi biết mình vay gì, ghi lại, và có kế hoạch trả. "Hardcode danh sách 5 mã giảm giá, TODO: đọc từ bảng khi có > 20" là nợ tốt.
- **Trả nợ khi nó chạm vào bạn**: refactor phần bạn đang sửa, không refactor cả kho "cho sạch".
- **80/20 cho chất lượng**: test unique/not-null trên mọi bảng tốn 1 giờ chặn được 80% lỗi; test nghiệp vụ tinh vi cho mọi bảng tốn 1 tháng chặn thêm 15%.

## Cách luyện

- Cuối mỗi tuần: 3 việc quan trọng nhất tuần sau là gì, và vì sao. Nếu không trả lời được "vì sao", việc đó chưa đáng làm.
- Giữ một file `TECH_DEBT.md` trong repo: mỗi khoản nợ một dòng, có ngày và lý do.

## Sai lầm hay gặp

- Tối ưu pipeline chạy 3 phút/ngày trong khi pipeline doanh thu không có test.
- Xây "framework tổng quát" cho use case chưa có.
- Đối lập: chất đống hack không ghi lại, đến khi không ai dám sửa gì.
