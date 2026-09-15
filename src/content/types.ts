export interface TreeNode {
  id: string          // đường dẫn URL, vd "nen-tang/data-modeling/scd"; gốc = ""
  slug: string
  title: string
  tagline?: string
  tools: string[]
  bigtech?: string
  body: string        // Markdown
  depth: number
  branch: number      // chỉ số nhánh cấp 1 (để tô màu); gốc = -1
  parent: TreeNode | null
  children: TreeNode[]
}
