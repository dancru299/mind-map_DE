---
title: Thu thập yêu cầu → SLA
tagline: Bốn con số phải chốt trước khi vẽ bất kỳ hộp nào
tools:
  - Freshness
  - Accuracy
  - Availability
  - Retention
  - Non-functional requirements
weight: 5
---

Yêu cầu chức năng ("bảng doanh thu theo ngày") dễ lấy. Yêu cầu **phi chức năng** mới quyết định kiến trúc, và người yêu cầu hiếm khi tự nói ra. Bốn con số:

| Câu hỏi | Ví dụ trả lời | Kéo theo |
|---|---|---|
| **Trễ bao lâu thì vẫn dùng được?** (freshness) | "Sáng hôm sau là được" / "trong 5 phút" | Batch đêm vs micro-batch vs streaming — khác nhau 10 lần chi phí |
| **Sai bao nhiêu thì chấp nhận?** (accuracy) | "Khớp kế toán từng đồng" / "±2% để nhìn xu hướng" | Đối chiếu, exactly-once, test — hay chỉ cần sanity check |
| **Hỏng thì chịu được bao lâu?** (availability / RTO) | "Không có báo cáo sáng thứ Hai là họp bị hoãn" | On-call, retry, backup, SLA với upstream |
| **Giữ bao lâu, ai được xem?** (retention / access) | "5 năm, chỉ tài chính" | Storage tiering, RBAC, xoá theo luật |

Cộng thêm: **quy mô hiện tại và 2 năm tới**, **nguồn có sẵn không** (và ai sở hữu nguồn), **có gì đang tồn tại cần thay thế không**.

Kết quả bước này là **một trang SLA** người yêu cầu ký (bằng email cũng được): "Bảng X sẵn sàng trước 7h, freshness ≤ 24h, khớp kế toán ±0,5%, giữ 5 năm, owner team data, người dùng team tài chính." Mọi tranh cãi sau này quay về trang này.

## Cách luyện

- Với yêu cầu tiếp theo, hỏi đủ 4 con số trước khi ước lượng thời gian. Ghi lại câu trả lời — nhiều khi người yêu cầu tự thấy "thực ra sáng hôm sau cũng được" khi biết real-time tốn gấp 10.

## Sai lầm hay gặp

- Mặc định "càng nhanh càng tốt" → xây streaming cho báo cáo tuần.
- Không hỏi "đúng bao nhiêu là đủ" → tốn hàng tuần cho exactly-once mà người dùng chỉ cần xu hướng.
- SLA nằm trong đầu, không nằm trên giấy → khi vỡ, không biết vỡ cái gì.
