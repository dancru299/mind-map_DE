---
title: Thống kê cơ bản cho DE
tagline: Đủ để hiểu "bất thường" là gì và không bị lừa bởi trung bình
tools:
  - Mean / median / percentile
  - Standard deviation
  - Distribution
  - Sampling
  - Seasonality
weight: 3
---

DE không làm mô hình thống kê, nhưng phải đọc được phân phối dữ liệu để: phát hiện bất thường, thiết kế test chất lượng, nói chuyện với DS, và không đưa số gây hiểu lầm.

- **Trung bình bị kéo bởi outlier; median thì không.** "Thời gian giao trung bình 2 ngày" có thể là 90% giao trong 1 ngày và 10% mất 10 ngày. Luôn xem cả p50 / p90 / p99.
- **Percentile là ngôn ngữ của SLA**: "p95 latency < 2 giây" có nghĩa hơn "trung bình 0,8 giây".
- **Độ lệch chuẩn & z-score** để đặt ngưỡng cảnh báo: số dòng hôm nay lệch quá 3σ so với 30 ngày qua → bất thường. Nhưng nhớ **mùa vụ**: thứ Hai khác Chủ nhật, cuối tháng khác đầu tháng — so với cùng thứ trong tuần trước.
- **Sampling**: kiểm tra 1% dữ liệu đủ để ước lượng null rate, không đủ để tìm dòng trùng. Biết khi nào mẫu là đủ.
- **Tương quan không phải nhân quả** — bạn sẽ được hỏi "doanh thu giảm có phải vì pipeline không?"; trả lời bằng dữ liệu, không bằng cảm giác.

```sql
-- Phân phối thời gian giao hàng: đừng chỉ nhìn AVG
SELECT
  APPROX_QUANTILES(delivery_hours, 100)[OFFSET(50)] AS p50,
  APPROX_QUANTILES(delivery_hours, 100)[OFFSET(90)] AS p90,
  APPROX_QUANTILES(delivery_hours, 100)[OFFSET(99)] AS p99,
  AVG(delivery_hours) AS mean, STDDEV(delivery_hours) AS sd
FROM fct_deliveries WHERE delivered_at >= CURRENT_DATE - 30;
```

## Sai lầm hay gặp

- Cảnh báo "số dòng giảm 20%" nổ mỗi Chủ nhật vì không tính mùa vụ tuần.
- Báo "tỷ lệ chuyển đổi tăng từ 2% lên 4%" trên 50 phiên — nhiễu, không phải tín hiệu.
- `AVG` trên cột có nhiều 0 do thiếu dữ liệu (thay vì NULL) → trung bình sụt giả.
