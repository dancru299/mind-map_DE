---
title: Dữ liệu cho AI / LLM
tagline: RAG, embedding, pipeline tài liệu — mảng mới mà DE đang được kéo vào
tools:
  - RAG
  - Embedding
  - Vector database
  - Chunking
  - Evaluation dataset
weight: 3
---

Ứng dụng LLM trong doanh nghiệp (chatbot nội bộ, tóm tắt tài liệu, trích thông tin) sống nhờ **pipeline dữ liệu** — và đó là việc của DE, không phải của model.

## RAG (Retrieval-Augmented Generation) từ góc DE

1. **Thu thập tài liệu**: Confluence, PDF, ticket, email, code — mỗi nguồn một connector, có incremental (chỉ lấy tài liệu đổi), có quyền truy cập đi kèm (ai được xem tài liệu nào).
2. **Làm sạch & chunking**: bỏ header/footer, tách thành đoạn 200–800 token có overlap, giữ metadata (nguồn, ngày, tác giả, quyền).
3. **Embedding**: gọi model embedding → vector; lưu vector + metadata vào vector DB (pgvector, Vertex/Bedrock vector search, Pinecone, Weaviate) hoặc BigQuery/Snowflake có hỗ trợ vector.
4. **Truy vấn**: câu hỏi → embedding → tìm top-k đoạn gần nhất (lọc theo quyền!) → đưa vào prompt.
5. **Đánh giá & giám sát**: bộ câu hỏi–đáp án mẫu, đo độ chính xác khi đổi model/chunking; log câu hỏi thật để tìm lỗ hổng tài liệu.

Toàn bộ 1–3 là pipeline batch/incremental quen thuộc: orchestration, idempotent, quality check (đoạn rỗng, tài liệu trùng, embedding lỗi), lineage từ câu trả lời về tài liệu gốc.

## Những thứ DE phải lo mà team AI hay quên

- **Quyền truy cập**: chatbot trả lời từ tài liệu người hỏi không được xem là sự cố bảo mật. Metadata quyền phải đi cùng chunk và được lọc lúc truy vấn.
- **Độ tươi**: tài liệu sửa hôm qua, index cập nhật khi nào?
- **Chi phí**: embedding lại toàn bộ mỗi đêm tốn gấp 100 lần incremental.
- **Dữ liệu cá nhân** trong tài liệu đi vào vector DB và prompt gửi cho nhà cung cấp bên ngoài — cần che trước.

## Sai lầm hay gặp

- Coi vector DB là "kho tài liệu" — nó là index; tài liệu gốc và metadata phải có nguồn sự thật riêng.
- Không có bộ đánh giá → đổi chunk size, không biết tốt hơn hay tệ hơn.
- Dùng LLM để "làm sạch dữ liệu" hàng loạt mà không kiểm tra mẫu — LLM bịa rất trôi chảy.
