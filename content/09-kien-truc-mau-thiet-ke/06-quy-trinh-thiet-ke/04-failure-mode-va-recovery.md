---
title: Failure mode & recovery
tagline: Liệt kê cách nó hỏng trước khi nó hỏng
tools:
  - Failure mode
  - Blast radius
  - Graceful degradation
  - Dead letter queue
  - Circuit breaker
weight: 4
---

Với mỗi thành phần trong thiết kế, hỏi ba câu: **hỏng kiểu gì? phát hiện bằng gì? khôi phục thế nào, mất gì?** Bảng trả lời thường dài hơn phần thiết kế chính — và đó là dấu hiệu tốt.

| Thành phần | Hỏng kiểu gì | Phát hiện | Khôi phục | Giảm thiệt hại từ thiết kế |
|---|---|---|---|---|
| Nguồn (DB app) | Đổi schema; ngừng ghi; xoá dữ liệu | Test schema ở raw; freshness | Liên hệ owner; dùng raw cũ | Data contract; CDC thay vì query |
| Ingestion | API rate limit; file đến trễ/trống; mạng | Retry hết; sensor timeout; volume check | Chạy lại theo ngày (idempotent) | Retry + backoff; landing zone; dead letter cho bản ghi lỗi |
| Kafka | Consumer lag; rebalance liên tục; hết retention | Lag alert | Replay từ offset; đọc lại từ lake | Retention ≥ 3 ngày; idempotent consumer |
| Transform (dbt/Spark) | Logic sai; OOM; skew | Test dữ liệu; job fail | Sửa + full refresh / backfill | Tách model nhỏ; test ở ranh giới lớp |
| Warehouse | Quota; xoá nhầm; chi phí bùng | Billing alert; audit log | Time travel; build lại từ raw | `require_partition_filter`; quyền tối thiểu |
| Orchestrator | Scheduler chết; DAG import lỗi; queue đầy | Heartbeat; import error alert | Restart; chạy tay | Managed service; pool; DAG nhỏ |
| Downstream (BI) | Đọc bảng đang được ghi dở | Số nhảy trong lúc chạy | — | Ghi vào bảng tạm rồi swap (atomic) |

Nguyên tắc thiết kế cho hỏng hóc:

- **Fail loudly, không fail silently.** Pipeline đỏ tốt hơn dashboard sai.
- **Giới hạn blast radius**: một nguồn hỏng không kéo cả DAG; một bảng lỗi không chặn 30 bảng khác.
- **Graceful degradation**: dashboard hiện dữ liệu hôm qua kèm nhãn "chưa cập nhật" tốt hơn trống trơn.
- **Dead letter**: bản ghi không parse được đi vào hàng đợi/bảng riêng, pipeline tiếp tục, ai đó xem sau.
- **Atomic publish**: build xong mới đổi tên/swap, người đọc không bao giờ thấy bảng nửa vời.

## Cách luyện

- Với thiết kế hiện tại của bạn, điền bảng trên. Ô nào trống ở cột "phát hiện" là nơi sự cố tiếp theo sẽ xảy ra mà không ai biết.
- "Game day": cố tình làm hỏng một thứ ở staging (xoá file, đổi schema) và xem hệ thống phản ứng.

## Sai lầm hay gặp

- Thiết kế cho happy path, xử lý lỗi bằng `retries=3`.
- Retry vô hạn trên lỗi không thể tự hết (schema sai) → chạy đi chạy lại cả đêm.
- Không phân biệt lỗi tạm (mạng) và lỗi vĩnh viễn (dữ liệu sai) — cùng một cách xử lý cho cả hai.
