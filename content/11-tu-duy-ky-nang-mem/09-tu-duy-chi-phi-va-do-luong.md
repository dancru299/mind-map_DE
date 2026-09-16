---
title: Tư duy chi phí & đo lường
tagline: Mọi quyết định kỹ thuật có giá; đo trước và sau, đừng đoán
tools:
  - Cost awareness
  - Measure before/after
  - Baseline
  - Premature optimization
  - Unit economics
weight: 4
---

Hai thái cực đều sai: DE không bao giờ nhìn hoá đơn, và DE tối ưu từng byte. Điểm đúng: **biết giá của mọi lựa chọn** và **chỉ tối ưu khi có số đo**.

Câu hỏi đặt ra cho mọi thiết kế:

- Chạy mỗi giờ thay vì mỗi ngày tốn thêm bao nhiêu, và ai cần dữ liệu tươi hơn 1 ngày?
- Streaming cho use case này tốn gấp mấy lần batch (hạ tầng + vận hành + kỹ năng team)?
- Bảng này 2 TB, ai đọc, đọc bao nhiêu lần, có cần giữ 5 năm không?
- Giữ tool SaaS này $2.000/tháng hay 3 ngày công tự dựng + 2 giờ/tháng bảo trì?

Nguyên tắc đo lường:

1. **Baseline trước.** Không có số "trước" thì không chứng minh được "sau" tốt hơn.
2. **Đo đúng thứ.** Query nhanh hơn nhưng byte quét gấp đôi? Pipeline nhanh hơn nhưng tốn gấp ba?
3. **Tối ưu thứ chạy nhiều**, không phải thứ chạy chậm. Query 10 giây chạy 500 lần/ngày > query 3 phút chạy 1 lần.
4. **Đừng tối ưu sớm.** Bảng 5 GB không cần partition, incremental, hay Spark. Làm đơn giản, đo, rồi mới tối ưu chỗ đau.
5. **Chi phí người > chi phí máy.** Một giờ của bạn thường đắt hơn một giờ chạy warehouse. Đừng tiết kiệm $20/tháng bằng 2 ngày công.

## Cách luyện

- Mở billing export/dashboard chi phí mỗi thứ Hai. Biết 5 pipeline/bảng đắt nhất và vì sao.
- Trước mỗi lần "tối ưu", ghi số hiện tại vào PR; sau khi merge, ghi số mới.

## Sai lầm hay gặp

- So thời gian chạy khi cache đang bật.
- Chọn giải pháp "scale được tới 100 lần" cho dữ liệu sẽ tăng 2 lần.
- Không tính chi phí vận hành (on-call, nâng cấp, học) khi so tool.
