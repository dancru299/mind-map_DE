import type { CSSProperties } from 'react'
import type { TreeNode } from './content/types'
import { colorOf } from './content/load'
import { useUserData } from './store/UserData'
import { progressOf } from './store/progress'

export function Legend({ root, onGo }: { root: TreeNode; onGo: (n: TreeNode) => void }) {
  const { progress } = useUserData()
  return (
    <div className="legend">
      {root.children.map(k => {
        const pc = Math.round(progressOf(k, progress) * 100)
        return (
          <span key={k.id} style={{ '--lc': colorOf(k), '--fill': `${pc}%` } as CSSProperties} onClick={() => onGo(k)} role="button" tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter') onGo(k) }} title={`${k.title}: ${pc}% · chiếm ${Math.round(k.share * 100)}% hành trình`}><i />{k.title}{pc > 0 && <small className="frac">{pc}%</small>}</span>
        )
      })}
    </div>
  )
}
