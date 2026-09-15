import type { TreeNode } from '../content/types'

// Kích thước cố định để layout thuần tuý, không cần đo DOM
export const NW = 220, NW0 = 252   // rộng node thường / gốc
export const NH = 50, NH0 = 62     // cao node thường / gốc
export const COL = 312, ROW = 62   // khoảng cách cột / hàng
export const PADX = 48, PADY = 40

export interface Placed { node: TreeNode; x: number; y: number; w: number; h: number }
export interface Layout { placed: Placed[]; byId: Map<string, Placed>; width: number; height: number }

/** Cây ngang, gốc bên trái. Lá xếp theo hàng; cha đặt giữa các con. */
export function layout(root: TreeNode, openIds: Set<string>): Layout {
  const placed: Placed[] = []
  let slot = 0, maxDepth = 0
  const walk = (n: TreeNode): number => {
    const isOpen = openIds.has(n.id) && n.children.length > 0
    let center: number
    if (isOpen) {
      const cs = n.children.map(walk)
      center = (cs[0] + cs[cs.length - 1]) / 2
    } else {
      center = slot++
    }
    const w = n.depth === 0 ? NW0 : NW, h = n.depth === 0 ? NH0 : NH
    placed.push({ node: n, x: PADX + n.depth * COL, y: PADY + center * ROW + ROW / 2 - h / 2, w, h })
    if (n.depth > maxDepth) maxDepth = n.depth
    return center
  }
  walk(root)
  return {
    placed, byId: new Map(placed.map(p => [p.node.id, p])),
    width: PADX * 2 + maxDepth * COL + NW0,
    height: PADY * 2 + Math.max(slot, 1) * ROW,
  }
}

export interface BBox { x1: number; y1: number; x2: number; y2: number; w: number; h: number }
export function bbox(list: Placed[]): BBox {
  let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity
  for (const p of list) { x1 = Math.min(x1, p.x); y1 = Math.min(y1, p.y); x2 = Math.max(x2, p.x + p.w); y2 = Math.max(y2, p.y + p.h) }
  return { x1, y1, x2, y2, w: x2 - x1, h: y2 - y1 }
}

export function linkPath(p: Placed, c: Placed): string {
  const x1 = p.x + p.w, y1 = p.y + p.h / 2, x2 = c.x, y2 = c.y + c.h / 2, mx = (x1 + x2) / 2
  return `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`
}
export function collapsedPath(p: Placed): string {
  const x = p.x + p.w, y = p.y + p.h / 2
  return `M${x},${y} C${x},${y} ${x},${y} ${x},${y}`
}
