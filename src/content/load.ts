import { tree, route } from 'virtual:content'
import type { TreeNode } from './types'

/**
 * Cây được dựng lúc build từ content/**.md (xem plugins/content-plugin.ts).
 * Ở đây chỉ gắn thêm parent / depth / branch / id để dùng trong UI.
 */
type Raw = typeof tree

function attach(r: Raw, parent: TreeNode | null, depth: number, branch: number): TreeNode {
  const id = depth === 0 ? '' : parent!.id ? `${parent!.id}/${r.slug}` : r.slug
  const node: TreeNode = { id, slug: r.slug, title: r.title, tagline: r.tagline, tools: r.tools, bigtech: r.bigtech, body: r.body, depth, branch, parent, children: [] }
  node.children = r.children.map((c, i) => attach(c, node, depth + 1, depth === 0 ? i : branch))
  return node
}

export const ROOT: TreeNode = attach(tree, null, 0, -1)
export const ALL: TreeNode[] = (() => { const out: TreeNode[] = []; (function walk(n: TreeNode) { out.push(n); n.children.forEach(walk) })(ROOT); return out })()
export const BY_ID: Map<string, TreeNode> = new Map(ALL.map(n => [n.id, n]))

export function pathOf(n: TreeNode): TreeNode[] { const out: TreeNode[] = []; let s: TreeNode | null = n; while (s) { out.unshift(s); s = s.parent } return out }
export function colorOf(n: TreeNode): string { return n.depth === 0 ? 'var(--accent)' : `var(--c${n.branch % 10})` }
export function isAncestorOrSelf(a: TreeNode, n: TreeNode): boolean { let s: TreeNode | null = n; while (s) { if (s === a) return true; s = s.parent } return false }

// ---- Lộ trình học ----
export interface Step { index: number; node: TreeNode; phase: number; phaseName: string; note?: string }
export const ROUTE_TITLE = route.title
export const ROUTE_INTRO = route.intro
export const PHASES: { name: string; goal?: string; steps: Step[] }[] = []
export const STEPS: Step[] = []
route.phases.forEach((ph, pi) => {
  const steps = ph.steps.map(st => {
    const step: Step = { index: STEPS.length + 1, node: BY_ID.get(st.id)!, phase: pi, phaseName: ph.name, note: st.note }
    STEPS.push(step); return step
  })
  PHASES.push({ name: ph.name, goal: ph.goal, steps })
})
export const STEP_BY_ID: Map<string, Step> = new Map(STEPS.map(s => [s.node.id, s]))
