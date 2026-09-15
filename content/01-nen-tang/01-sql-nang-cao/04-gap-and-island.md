---
title: Gaps & islands
tagline: Tìm chuỗi ngày liên tiếp, phiên hoạt động, khoảng trống
tools:
  - ROW_NUMBER
  - LAG
  - DATE_DIFF
  - Session-ization
---

Bài toán kinh điển: người dùng đăng nhập những ngày nào liên tiếp (streak)? Máy ngừng hoạt động từ lúc nào đến lúc nào? Các sự kiện cách nhau dưới 30 phút thuộc cùng một phiên?

Ý tưởng chung: đánh dấu điểm **bắt đầu một "đảo" mới** (khi khoảng cách tới dòng trước vượt ngưỡng), cộng dồn số lần bắt đầu để có id đảo, rồi gom theo id đó.

```sql
WITH marked AS (
  SELECT user_id, event_ts,
         CASE WHEN TIMESTAMP_DIFF(event_ts,
                LAG(event_ts) OVER (PARTITION BY user_id ORDER BY event_ts), MINUTE) > 30
              OR LAG(event_ts) OVER (PARTITION BY user_id ORDER BY event_ts) IS NULL
              THEN 1 ELSE 0 END AS new_session
  FROM events
),
sessions AS (
  SELECT *, SUM(new_session) OVER (PARTITION BY user_id ORDER BY event_ts) AS session_id
  FROM marked
)
SELECT user_id, session_id, MIN(event_ts) AS started_at, MAX(event_ts) AS ended_at, COUNT(*) AS events
FROM sessions
GROUP BY user_id, session_id;
```

Biến thể cho ngày liên tiếp: `date - ROW_NUMBER() OVER (...)` cho ra một hằng số trong mỗi chuỗi liên tiếp — gom theo hằng số đó.

## Sai lầm hay gặp

- Định nghĩa "phiên" khác nhau giữa DE và team product (30 phút? 20 phút? theo ngày?). Chốt định nghĩa trước khi viết SQL, ghi vào docs của bảng.
- Dữ liệu đến trễ làm phiên bị cắt đôi khi tính incremental. Tính lại một cửa sổ nhìn lùi (vd 2 ngày) thay vì chỉ dữ liệu mới.
