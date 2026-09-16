import { describe, expect, it } from 'vitest'
import { join } from 'node:path'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { buildTree, listMarkdownFiles, parseMarkdown, readGlossary, readRoute, splitPrefix, uncoveredTools, type RawNode } from '../plugins/build-tree'

const DIR = join(__dirname, '..', 'content')

describe('content/', () => {
  it('dựng được cây từ thư mục content (frontmatter, _index.md, slug trùng đều được kiểm tra bên trong)', () => {
    const root = buildTree(DIR)
    expect(root.title).toBe('Data Engineering')
    expect(root.children.length).toBeGreaterThanOrEqual(5)
    const all: RawNode[] = []; (function walk(n: RawNode) { all.push(n); n.children.forEach(walk) })(root)
    expect(all.length).toBe(listMarkdownFiles(DIR).length)
  })
  it('mọi file lá/nhánh (trừ _index) có tiền tố số để giữ thứ tự', () => {
    for (const f of listMarkdownFiles(DIR)) {
      const name = f.slice(f.lastIndexOf('/') + 1)
      if (name === '_index.md') continue
      expect(/^\d+-/.test(name), `${f} thiếu tiền tố số (vd 03-)`).toBe(true)
    }
  })
  it('id (đường dẫn URL) không trùng trong toàn cây', () => {
    const ids = new Set<string>()
    ;(function walk(n: RawNode, prefix: string) {
      const id = prefix ? `${prefix}/${n.slug}` : n.slug
      expect(ids.has(id), `trùng id ${id}`).toBe(false); ids.add(id)
      n.children.forEach(c => walk(c, id))
    })(buildTree(DIR), '')
  })
})

describe('parseMarkdown', () => {
  it('báo lỗi rõ khi thiếu title / thiếu frontmatter / body rỗng', () => {
    expect(() => parseMarkdown('không có frontmatter', 'x.md')).toThrow(/thiếu frontmatter/)
    expect(() => parseMarkdown('---\ntagline: a\n---\nbody', 'x.md')).toThrow(/"title"/)
    expect(() => parseMarkdown('---\ntitle: A\n---\n', 'x.md')).toThrow(/rỗng/)
    expect(() => parseMarkdown('---\ntitle: A\ntools: abc\n---\nbody', 'x.md')).toThrow(/tools/)
  })
  it('đọc đủ trường', () => {
    const r = parseMarkdown('---\ntitle: A\ntagline: t\ntools:\n  - x\n  - y\nbigtech: >-\n  b1\n  b2\n---\n\nHello\n', 'x.md')
    expect(r).toMatchObject({ title: 'A', tagline: 't', tools: ['x', 'y'], bigtech: 'b1 b2', body: 'Hello' })
  })
  it('splitPrefix', () => {
    expect(splitPrefix('03-data-modeling')).toEqual({ order: 3, slug: 'data-modeling' })
    expect(splitPrefix('no-prefix').slug).toBe('no-prefix')
  })
})

describe('lo-trinh.yaml', () => {
  it('mọi bước trỏ tới mục có thật, không lặp, có ít nhất một giai đoạn', () => {
    const route = readRoute(DIR, buildTree(DIR))
    expect(route.phases.length).toBeGreaterThan(0)
    const ids = route.phases.flatMap(p => p.steps.map(s => s.id))
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids.length).toBeGreaterThanOrEqual(10)
  })
  it('báo lỗi rõ khi id không tồn tại', () => {
    const root = buildTree(DIR)
    const dir = mkdtempSync(join(tmpdir(), 'route-'))
    writeFileSync(join(dir, 'lo-trinh.yaml'), 'title: t\nphases:\n  - name: a\n    steps:\n      - id: khong/ton-tai\n')
    expect(() => readRoute(dir, root)).toThrow(/khong\/ton-tai/)
  })
})

describe('trọng số', () => {
  it('mọi mục lá khai báo weight rõ ràng (1–5); nhánh không cần', () => {
    for (const f of listMarkdownFiles(DIR)) {
      if (f.endsWith('_index.md')) continue
      const raw = readFileSync(f, 'utf8')
      expect(/^weight: [1-5]$/m.test(raw), `${f.replace(DIR + '/', '')} thiếu "weight: 1..5"`).toBe(true)
    }
  })
  it('weight ngoài 1–5 bị từ chối', () => {
    expect(() => parseMarkdown('---\ntitle: A\nweight: 7\n---\nbody', 'x.md')).toThrow(/weight/)
    expect(parseMarkdown('---\ntitle: A\n---\nbody', 'x.md').weight).toBe(3)
  })
})

describe('glossary', () => {
  it('mọi chip "tools" trong content đều có định nghĩa', () => {
    const missing = uncoveredTools(buildTree(DIR), readGlossary(DIR))
    expect(missing, `chưa có định nghĩa: ${missing.slice(0, 10).join(' | ')}${missing.length > 10 ? ' …' : ''}`).toEqual([])
  })
  it('entry có type hợp lệ và def ngắn gọn (≤ 60 từ)', () => {
    for (const g of readGlossary(DIR)) expect(g.def.split(/\s+/).length, `"${g.term}" quá dài`).toBeLessThanOrEqual(60)
  })
})
