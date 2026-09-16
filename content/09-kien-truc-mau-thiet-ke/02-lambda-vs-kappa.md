---
title: Lambda vs Kappa
tagline: Hai đường batch + speed, hay một đường streaming
tools:
  - Lambda architecture
  - Kappa architecture
  - Replay
  - Speed layer
  - Batch layer
weight: 3
---

- Lambda: một đường batch (chính xác, chậm) và một đường streaming (nhanh, xấp xỉ), ghép kết quả. Đúng nhưng phải viết logic hai lần.
- Kappa: chỉ một đường streaming, cần tính lại thì replay log. Đơn giản hơn nhưng đòi hỏi streaming engine mạnh và log giữ lâu.

Thực tế đa số công ty: batch là chính, streaming cho vài use case cụ thể.
