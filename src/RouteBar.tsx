import type { TreeNode } from './content/types'
import { PHASES, STEPS, STEP_BY_ID } from './content/load'
import { useUserData } from './store/UserData'
import { progressOf } from './store/progress'

/** Thanh lộ trình thay cho chú giải khi bật chế độ Lộ trình: giai đoạn + bước hiện tại + trước/sau */
export function RouteBar({ selected, onGo }: { selected: TreeNode; onGo: (n: TreeNode) => void }) {
  const { progress } = useUserData()
  const cur = STEP_BY_ID.get(selected.id)
  const prev = cur ? STEPS[cur.index - 2] : undefined, next = cur ? STEPS[cur.index] : STEPS[0]
  return (
    <div className="routebar">
      <div className="phases">
        {PHASES.map((ph, i) => {
          const wsum = ph.steps.reduce((a, s) => a + s.node.weightSum, 0)
          const pc = Math.round(ph.steps.reduce((a, s) => a + progressOf(s.node, progress) * s.node.weightSum, 0) / wsum * 100)
          return (
            <button key={ph.name} className={[cur?.phase === i ? 'on' : '', pc >= 100 ? 'done' : ''].filter(Boolean).join(' ') || undefined}
              onClick={() => onGo(ph.steps[0].node)} title={`${ph.goal ?? ''}\n${ph.steps.length} bước · nắm vững ${pc}%`} style={{ '--fill': `${pc}%` } as React.CSSProperties}>
              <b>{i + 1}</b>{ph.name}{pc > 0 && <span className="frac">{pc}%</span>}
            </button>
          )
        })}
      </div>
      <div className="stepnav">
        <span className="pos">{cur ? `Bước ${cur.index}/${STEPS.length}` : 'Ngoài lộ trình'}</span>
        <button disabled={!prev} onClick={() => prev && onGo(prev.node)} title="Bước trước (P)">←</button>
        <button disabled={!next} onClick={() => next && onGo(next.node)} title="Bước sau (N)">→</button>
      </div>
    </div>
  )
}
