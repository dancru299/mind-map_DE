import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import hljs from 'highlight.js/lib/core'
import sql from 'highlight.js/lib/languages/sql'
import python from 'highlight.js/lib/languages/python'
import bash from 'highlight.js/lib/languages/bash'
import yaml from 'highlight.js/lib/languages/yaml'
import json from 'highlight.js/lib/languages/json'
import type { CSSProperties } from 'react'
import type { TreeNode } from '../content/types'
import { PHASES, ROUTE_INTRO, ROUTE_TITLE, STEPS, STEP_BY_ID, colorOf, pathOf } from '../content/load'

// Chỉ đăng ký ngôn ngữ cần dùng — rehype-highlight kéo theo cả bộ "common" ~300KB
hljs.registerLanguage('sql', sql); hljs.registerLanguage('python', python); hljs.registerLanguage('bash', bash)
hljs.registerLanguage('sh', bash); hljs.registerLanguage('yaml', yaml); hljs.registerLanguage('yml', yaml); hljs.registerLanguage('json', json)

const remarkPlugins = [remarkGfm]
const components: Components = {
  code({ className, children }) {
    const lang = /language-([\w-]+)/.exec(className ?? '')?.[1]
    if (lang && hljs.getLanguage(lang)) {
      // Nội dung là Markdown của chính repo; hljs escape HTML trước khi tô màu
      return <code className={`hljs ${className}`} dangerouslySetInnerHTML={{ __html: hljs.highlight(String(children).replace(/\n$/, ''), { language: lang }).value }} />
    }
    return <code className={className}>{children}</code>
  },
}

interface Props { node: TreeNode; routeMode: boolean; onGo: (n: TreeNode) => void }

export function DetailPanel({ node: n, routeMode, onGo }: Props) {
  const chain = pathOf(n), branch = chain[1] ?? n
  const sib = n.parent ? n.parent.children : [], idx = sib.indexOf(n)
  const step = STEP_BY_ID.get(n.id)
  return (
    <aside className="panel">
      <div className="panel-in">
        <nav className="crumb" aria-label="Đường dẫn">
          {chain.map((s, i) => (
            <span key={s.id}>
              {i > 0 && <span className="sep">/</span>}
              {i === chain.length - 1 ? <span className="cur">{s.title}</span> : <button onClick={() => onGo(s)}>{s.title}</button>}
            </span>
          ))}
        </nav>
        <div className="ptitle" style={{ '--lc': colorOf(n) } as CSSProperties}>
          <span className="eyebrow"><i />{n.depth === 0 ? 'Gốc' : branch.title}{n.depth > 1 ? ` · cấp ${n.depth}` : ''}</span>
          <h2>{n.title}</h2>
          {n.tagline && <div className="tag">{n.tagline}</div>}
        </div>
        {routeMode && step && (
          <div className="route">
            <div className="rhead"><b>Bước {step.index}/{STEPS.length}</b><span>{step.phaseName}</span></div>
            {step.note && <p>{step.note}</p>}
            <div className="rnav">
              <button disabled={step.index <= 1} onClick={() => onGo(STEPS[step.index - 2].node)}>← Bước trước</button>
              <button disabled={step.index >= STEPS.length} onClick={() => onGo(STEPS[step.index].node)}>Bước sau →</button>
            </div>
          </div>
        )}
        {routeMode && !step && n.depth > 0 && (
          <div className="route muted">Mục này không nằm trong lộ trình gợi ý — đọc thêm khi cần. <button onClick={() => onGo(STEPS[0].node)}>Về bước 1 →</button></div>
        )}
        {routeMode && n.depth === 0 && STEPS.length > 0 && (
          <div className="route toc">
            <div className="rhead"><b>{ROUTE_TITLE}</b><span>{STEPS.length} bước</span></div>
            {ROUTE_INTRO && <p>{ROUTE_INTRO}</p>}
            {PHASES.map((ph, i) => (
              <div className="phase" key={ph.name}>
                <h4><b>{i + 1}</b>{ph.name}</h4>
                {ph.goal && <small>{ph.goal}</small>}
                <ol start={ph.steps[0].index}>
                  {ph.steps.map(st => <li key={st.node.id}><button onClick={() => onGo(st.node)}>{st.node.title}</button></li>)}
                </ol>
              </div>
            ))}
          </div>
        )}
        <div className="sec desc">
          <ReactMarkdown remarkPlugins={remarkPlugins} components={components}>{n.body}</ReactMarkdown>
        </div>
        {n.tools.length > 0 && (
          <div className="sec"><h3>Công cụ &amp; từ khoá</h3><div className="chips">{n.tools.map(t => <span className="chip" key={t}>{t}</span>)}</div></div>
        )}
        {n.bigtech && <div className="callout"><b>Big tech vs công ty thường</b>{n.bigtech}</div>}
        {n.children.length > 0 && (
          <div className="sec"><h3>Nhánh con · {n.children.length}</h3>
            <div className="kids">
              {n.children.map(k => (
                <button key={k.id} onClick={() => onGo(k)} style={{ '--lc': colorOf(k) } as CSSProperties}>
                  <i /><span>{k.title}</span><small>{k.children.length ? `${k.children.length} nhánh` : 'khái niệm'}</small>
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="pnav">
          <button disabled={!n.parent} onClick={() => n.parent && onGo(n.parent)}>↑ Lên cha</button>
          <button disabled={idx <= 0} onClick={() => onGo(sib[idx - 1])}>← Trước</button>
          <button disabled={idx < 0 || idx >= sib.length - 1} onClick={() => onGo(sib[idx + 1])}>Sau →</button>
        </div>
      </div>
    </aside>
  )
}
