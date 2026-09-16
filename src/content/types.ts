export interface TreeNode {
  id: string          // đường dẫn URL, vd "nen-tang/data-modeling/scd"; gốc = ""
  slug: string
  title: string
  tagline?: string
  tools: string[]
  bigtech?: string
  weight: number      // trọng số 1–5 (mục lá). Nhánh: không dùng trực tiếp
  weightSum: number   // tổng trọng số các lá trong cây con (lá = weight của chính nó)
  share: number       // phần của hành trình, 0..1 = weightSum / tổng toàn cây
  body: string        // Markdown
  depth: number
  branch: number      // chỉ số nhánh cấp 1 (để tô màu); gốc = -1
  parent: TreeNode | null
  children: TreeNode[]
}
