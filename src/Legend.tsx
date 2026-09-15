import type { CSSProperties } from 'react'
import type { TreeNode } from './content/types'
import { colorOf } from './content/load'

export function Legend({ root, onGo }: { root: TreeNode; onGo: (n: TreeNode) => void }) {
  return (
    <div className="legend">
      {root.children.map(k => (
        <span key={k.id} style={{ '--lc': colorOf(k) } as CSSProperties} onClick={() => onGo(k)} role="button" tabIndex={0}
          onKeyDown={e => { if (e.key === 'Enter') onGo(k) }}><i />{k.title}</span>
      ))}
    </div>
  )
}
