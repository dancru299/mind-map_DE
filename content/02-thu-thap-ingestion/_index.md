---
title: Thu thập (Ingestion)
tagline: Đưa dữ liệu từ nơi sinh ra vào nền tảng dữ liệu
tools:
  - Batch
  - CDC
  - Streaming
  - Connector
  - Raw layer
bigtech: >-
  Big tech: nguồn chủ yếu là event log nội bộ, có hệ thống logging chuẩn hoá sẵn. Công ty thường:
  nguồn là DB ứng dụng, file Excel, API SaaS, SFTP của đối tác — bẩn và không chuẩn.
---

Bước đầu của mọi pipeline. Câu hỏi thiết kế: lấy toàn bộ hay phần thay đổi? Theo lịch hay theo sự kiện? Ai chịu trách nhiệm khi nguồn đổi schema?

Nguyên tắc: giữ bản thô (raw) nguyên vẹn trước, biến đổi sau. Mất raw là mất khả năng làm lại.
