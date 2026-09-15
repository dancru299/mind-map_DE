---
title: Lập trình
tagline: Python là mặc định, Scala/Java khi cần Spark/Flink sâu
tools:
  - Python
  - PySpark
  - Scala
  - Jinja
  - pytest
  - Bash
bigtech: >-
  Big tech: yêu cầu coding rigor cao, có code review nghiêm, đôi khi C++/Java. Công ty thường:
  Python + SQL là đủ, nhưng test và CI thường bị bỏ qua — đây là chỗ Dev chuyển sang có lợi thế.
---

DE viết code, nhưng phần lớn là glue code: đọc nguồn, gọi API, biến đổi, ghi đích, xử lý lỗi. Sạch và có test quan trọng hơn thông minh.

- Python: pandas/polars, requests, SDK của cloud, Airflow DAG, dbt macro (Jinja).
- Scala/Java: khi tối ưu Spark/Flink ở mức thấp hoặc viết connector.
- Bash: gần như mọi pipeline cũ đều có một đoạn shell ở đâu đó.
