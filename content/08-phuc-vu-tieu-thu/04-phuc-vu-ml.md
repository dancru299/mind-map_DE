---
title: Phục vụ ML
tagline: Feature store, training dataset, và ranh giới với MLE
tools:
  - Feature store
  - Feast
  - Point-in-time join
  - Training/serving skew
  - Vertex AI
  - SageMaker
bigtech: >-
  Big tech: DE cho ML là một chuyên ngành riêng, feature pipeline chạy streaming. Công ty thường: DE
  + Data Scientist tự thoả thuận, thường qua bảng trong warehouse.
weight: 3
---

DE cung cấp dữ liệu sạch, đúng point-in-time (không rò rỉ tương lai vào training), và feature được tính nhất quán giữa lúc train và lúc serve. Feature store (Feast, Vertex, SageMaker) giải bài toán nhất quán này.

Ranh giới: DE làm pipeline dữ liệu và feature; MLE làm model, deploy và giám sát model.
