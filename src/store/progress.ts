import type { TreeNode } from '../content/types'
import { ALL, ROOT } from '../content/load'

/** Các mốc nắm vững có nghĩa — dùng cho chip chọn nhanh; thanh trượt cho phép giá trị lẻ */
export const LEVELS: { value: number; label: string; hint: string }[] = [
  { value: 0, label: 'Chưa học', hint: 'Chưa đọc hoặc chưa hiểu gì' },
  { value: 25, label: 'Đã đọc', hint: 'Biết khái niệm là gì, chưa tự làm được' },
  { value: 50, label: 'Hiểu cơ bản', hint: 'Giải thích được, làm được khi có hướng dẫn' },
  { value: 75, label: 'Làm được', hint: 'Tự làm trong công việc thật, còn phải tra cứu' },
  { value: 100, label: 'Thành thạo', hint: 'Làm không cần tra, dạy lại được, biết bẫy' },
]
export const levelLabel = (m: number) => m >= 100 ? 'Thành thạo' : m >= 75 ? 'Làm được' : m >= 50 ? 'Hiểu cơ bản' : m > 0 ? 'Đã đọc' : 'Chưa học'

export type MasteryMap = Map<string, { mastery: number }>

/**
 * Tiến độ có trọng số của một node, 0..1.
 * Lá: mastery/100. Nhánh: Σ(tiến độ con × trọng số con) / Σ trọng số con — mục quan trọng kéo nhiều hơn.
 */
export function progressOf(n: TreeNode, m: MasteryMap): number {
  if (!n.children.length) return (m.get(n.id)?.mastery ?? 0) / 100
  let acc = 0
  for (const c of n.children) acc += progressOf(c, m) * c.weightSum
  return n.weightSum ? acc / n.weightSum : 0
}
export const pct = (x: number) => Math.round(x * 100)

export const leaves = (n: TreeNode): TreeNode[] => n.children.length ? n.children.flatMap(leaves) : [n]

/** Mục lá quan trọng (trọng số cao) mà còn yếu — gợi ý học tiếp */
export function weakSpots(m: MasteryMap, limit = 6, under = 50): TreeNode[] {
  return ALL.filter(n => !n.children.length && (m.get(n.id)?.mastery ?? 0) < under)
    .sort((a, b) => b.weight - a.weight || (m.get(a.id)?.mastery ?? 0) - (m.get(b.id)?.mastery ?? 0))
    .slice(0, limit)
}

export function summary(m: MasteryMap) {
  const total = progressOf(ROOT, m)
  const branches = ROOT.children.map(b => ({ node: b, progress: progressOf(b, m) }))
  const ls = leaves(ROOT)
  const touched = ls.filter(l => (m.get(l.id)?.mastery ?? 0) > 0).length
  const mastered = ls.filter(l => (m.get(l.id)?.mastery ?? 0) >= 100).length
  return { total, branches, leafCount: ls.length, touched, mastered }
}
