---
title: Python data stack
tagline: pandas, polars, DuckDB — xử lý vừa và nhỏ trên một máy
tools:
  - pandas
  - polars
  - DuckDB
  - PyArrow
  - Ibis
---

Dữ liệu dưới vài chục GB không cần Spark. pandas quen thuộc nhưng chậm và tốn RAM; polars nhanh hơn nhiều; DuckDB cho phép chạy SQL analytics trên file Parquet ngay trong Python.

Nhiều pipeline ở công ty thường thực chất là Python script + Airflow — đây là chỗ Dev vào nhanh nhất.
