// Node-only: đọc content/**/*.md → cây JSON tuần tự hoá được (dùng cho Vite plugin và test)
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { load as loadYaml } from 'js-yaml'

export interface RawNode {
  slug: string
  title: string
  tagline?: string
  tools: string[]
  bigtech?: string
  body: string
  file: string           // đường dẫn tương đối, để báo lỗi
  children: RawNode[]
}

const FM = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/

export function parseMarkdown(raw: string, file: string): Omit<RawNode, 'slug' | 'children' | 'file'> {
  const m = FM.exec(raw)
  if (!m) throw new Error(`${file}: thiếu frontmatter (--- ... ---)`)
  let meta: Record<string, unknown>
  try { meta = (loadYaml(m[1]) ?? {}) as Record<string, unknown> }
  catch (e) { throw new Error(`${file}: frontmatter YAML lỗi — ${(e as Error).message.split('\n')[0]}`) }
  if (typeof meta.title !== 'string' || !meta.title.trim()) throw new Error(`${file}: frontmatter thiếu "title"`)
  if (meta.tools != null && !(Array.isArray(meta.tools) && meta.tools.every(t => typeof t === 'string'))) throw new Error(`${file}: "tools" phải là danh sách chuỗi`)
  for (const k of ['tagline', 'bigtech'] as const) if (meta[k] != null && typeof meta[k] !== 'string') throw new Error(`${file}: "${k}" phải là chuỗi`)
  const body = m[2].trim()
  if (!body) throw new Error(`${file}: thân mô tả rỗng`)
  return { title: meta.title.trim(), tagline: meta.tagline as string | undefined, tools: (meta.tools as string[] | undefined) ?? [], bigtech: meta.bigtech as string | undefined, body }
}

/** "03-data-modeling" → { order: 3, slug: "data-modeling" } */
export function splitPrefix(name: string): { order: number; slug: string } {
  const m = /^(\d+)-(.+)$/.exec(name)
  return m ? { order: Number(m[1]), slug: m[2] } : { order: Number.MAX_SAFE_INTEGER, slug: name }
}

export function listMarkdownFiles(dir: string, out: string[] = []): string[] {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f)
    if (statSync(p).isDirectory()) listMarkdownFiles(p, out)
    else if (f.endsWith('.md')) out.push(p)
  }
  return out
}

/** Thư mục = nhánh (phải có _index.md), file .md = lá. Tiền tố số quyết định thứ tự. */
export function buildTree(contentDir: string): RawNode {
  const build = (dir: string, name: string): RawNode => {
    const entries = readdirSync(dir)
    if (!entries.includes('_index.md')) throw new Error(`${relative(contentDir, dir) || 'content'}: thư mục thiếu _index.md`)
    const file = relative(contentDir, join(dir, '_index.md'))
    const node: RawNode = { slug: splitPrefix(name).slug, ...parseMarkdown(readFileSync(join(dir, '_index.md'), 'utf8'), file), file, children: [] }
    const kids: { order: number; name: string; node: RawNode }[] = []
    for (const e of entries) {
      if (e === '_index.md' || e.startsWith('.')) continue
      const p = join(dir, e)
      if (statSync(p).isDirectory()) kids.push({ ...splitPrefix(e), name: e, node: build(p, e) })
      else if (e.endsWith('.md')) {
        const base = e.replace(/\.md$/, ''), rel = relative(contentDir, p)
        kids.push({ ...splitPrefix(base), name: e, node: { slug: splitPrefix(base).slug, ...parseMarkdown(readFileSync(p, 'utf8'), rel), file: rel, children: [] } })
      }
    }
    kids.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
    const seen = new Set<string>()
    for (const k of kids) {
      if (seen.has(k.node.slug)) throw new Error(`${relative(contentDir, dir) || 'content'}: slug "${k.node.slug}" bị trùng`)
      seen.add(k.node.slug)
    }
    node.children = kids.map(k => k.node)
    return node
  }
  const root = build(contentDir, '')
  root.slug = ''
  return root
}

// ---- Lộ trình học (content/lo-trinh.yaml) ----
export interface RouteStep { id: string; note?: string }
export interface RoutePhase { name: string; goal?: string; steps: RouteStep[] }
export interface Route { title: string; intro?: string; phases: RoutePhase[] }

export function collectIds(root: RawNode): Set<string> {
  const ids = new Set<string>()
  ;(function walk(n: RawNode, prefix: string) {
    const id = prefix ? `${prefix}/${n.slug}` : n.slug
    ids.add(id); n.children.forEach(c => walk(c, id))
  })(root, '')
  return ids
}

/** Đọc lo-trinh.yaml, kiểm tra mọi id có trong cây và không lặp. Không có file → lộ trình rỗng. */
export function readRoute(contentDir: string, root: RawNode): Route {
  const file = join(contentDir, 'lo-trinh.yaml')
  if (!existsSync(file)) return { title: 'Lộ trình', phases: [] }
  const raw = (loadYaml(readFileSync(file, 'utf8')) ?? {}) as Partial<Route>
  if (typeof raw.title !== 'string') throw new Error('lo-trinh.yaml: thiếu "title"')
  if (!Array.isArray(raw.phases)) throw new Error('lo-trinh.yaml: "phases" phải là danh sách')
  const ids = collectIds(root), seen = new Set<string>()
  const phases = raw.phases.map((ph, i) => {
    if (typeof ph?.name !== 'string' || !Array.isArray(ph.steps)) throw new Error(`lo-trinh.yaml: giai đoạn #${i + 1} thiếu "name" hoặc "steps"`)
    const steps = ph.steps.map(st => {
      const step = typeof st === 'string' ? { id: st } : st
      if (typeof step?.id !== 'string') throw new Error(`lo-trinh.yaml: bước trong "${ph.name}" thiếu "id"`)
      if (!ids.has(step.id)) throw new Error(`lo-trinh.yaml: id "${step.id}" không có trong content/`)
      if (seen.has(step.id)) throw new Error(`lo-trinh.yaml: id "${step.id}" xuất hiện hai lần`)
      seen.add(step.id)
      return { id: step.id, note: step.note }
    })
    return { name: ph.name, goal: ph.goal, steps }
  })
  return { title: raw.title, intro: raw.intro, phases }
}
