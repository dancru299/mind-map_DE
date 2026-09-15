# Gia phả Data Engineering

Sơ đồ cây tương tác về ngành Data Engineering: bấm vào từng nhánh để đi sâu, mỗi mục có khái niệm,
công cụ tiêu biểu và ghi chú *big tech vs công ty thường*. Nội dung viết bằng Markdown, giao diện
là React, deploy tĩnh lên Vercel.

## Chạy local

```bash
npm install
npm run dev        # http://localhost:5173
```

```bash
npm test           # kiểm tra nội dung: frontmatter, thứ tự, slug trùng
npm run build      # tsc + vite build → dist/
```

## Thêm / sửa nội dung

Toàn bộ nội dung nằm trong `content/`. Cấu trúc thư mục **chính là** cấu trúc cây:

```
content/
├── _index.md                      # gốc "Data Engineering"
├── 01-nen-tang/
│   ├── _index.md                  # nhánh "Nền tảng"
│   ├── 01-sql-nang-cao.md         # mục lá
│   └── 02-data-modeling/          # nhánh con = thư mục có _index.md
│       ├── _index.md
│       └── 01-dimensional-modeling-kimball.md
└── 02-thu-thap-ingestion/...
```

- Tiền tố số (`01-`, `02-`…) quyết định thứ tự hiển thị và bị bỏ khỏi URL.
  `content/01-nen-tang/02-data-modeling/_index.md` → `/nen-tang/data-modeling`.
- Muốn biến một mục lá thành nhánh: đổi `03-foo.md` thành thư mục `03-foo/` chứa `_index.md` (nội dung cũ) và các file con.

Mỗi file có frontmatter YAML rồi đến thân Markdown:

```markdown
---
title: Slowly Changing Dimension (SCD)
tagline: Khách hàng đổi địa chỉ — lịch sử giữ thế nào?
tools:
  - SCD Type 2
  - dbt snapshot
bigtech: >-
  Ghi chú khác biệt giữa big tech và công ty thường (tuỳ chọn).
---

Đoạn mô tả. Hỗ trợ **Markdown** đầy đủ: bullet, bảng, code block có tô màu (sql, python, bash, yaml, json).

- Type 1: ghi đè, mất lịch sử.
- Type 2: thêm dòng mới với valid_from / valid_to.

```sql
MERGE INTO dim_customer t USING stg_customer s ON t.customer_id = s.customer_id ...
```
```

Chỉ `title` là bắt buộc. Chạy `npm test` sau khi sửa để bắt lỗi thiếu frontmatter, thiếu `_index.md`, slug trùng.

## Lộ trình học

`content/lo-trinh.yaml` định nghĩa thứ tự học gợi ý theo giai đoạn. Nút **Lộ trình** trên thanh công cụ bật chế độ
này: node trên cây được đánh số bước, mục ngoài lộ trình mờ đi, panel có nút bước trước/sau (phím `N` / `P`),
và mục gốc hiện toàn bộ lộ trình.

```yaml
title: Lộ trình cho Dev chuyển sang DE
intro: >-
  Vài dòng giới thiệu.
phases:
  - name: Nền móng
    goal: "Tuần 1–3. …"
    steps:
      - id: nen-tang/sql-nang-cao/window-function     # = đường dẫn URL của mục, không có / đầu
        note: >-
          Vì sao học mục này lúc này.
```

Id sai hoặc lặp làm `npm test` và `npm run build` fail với thông báo rõ.

## Deploy lên Vercel

1. Đẩy repo lên GitHub (hoặc GitLab/Bitbucket).
2. Vào [vercel.com/new](https://vercel.com/new) → Import repo. Vercel tự nhận Vite:
   build command `npm run build`, output `dist`.
3. `vercel.json` đã có rewrite để mọi đường dẫn (`/nen-tang/data-modeling`) đều trả về `index.html`.
4. Sau đó mỗi lần `git push` lên nhánh chính là tự deploy.

## Cấu trúc code

```
src/
├── content/     # đọc content/**/*.md lúc build (import.meta.glob), parse frontmatter, dựng cây
├── tree/        # layout cây (thuần), pan/zoom (useViewport), TreeCanvas
├── panel/       # panel chi tiết, render Markdown
├── Search.tsx   # tìm kiếm không dấu
├── Legend.tsx
└── App.tsx      # trạng thái mở/đóng, URL ↔ mục đang chọn, phím tắt
plugins/     # Vite plugin đọc content/ + lo-trinh.yaml lúc build (virtual:content)
tests/content.test.ts   # kiểm tra nội dung và lộ trình
```

Phím tắt: `→ ←` vào con / về cha · `↑ ↓` anh em · `Enter` mở/đóng · `+ − 0` zoom / vừa màn hình · `C` về mục đang chọn · `N P` bước sau / trước trong lộ trình · `/` tìm kiếm.
# mind-map_DE
# mind-map_DE
