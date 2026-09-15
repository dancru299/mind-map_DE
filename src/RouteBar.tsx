import type { TreeNode } from './content/types'
import { PHASES, STEPS, STEP_BY_ID } from './content/load'

/** Thanh lộ trình thay cho chú giải khi bật chế độ Lộ trình: giai đoạn + bước hiện tại + trước/sau */
export function RouteBar({ selected, onGo }: { selected: TreeNode; onGo: (n: TreeNode) => void }) {
  const cur = STEP_BY_ID.get(selected.id)
  const prev = cur ? STEPS[cur.index - 2] : undefined, next = cur ? STEPS[cur.index] : STEPS[0]
  return (
    <div className="routebar">
      <div className="phases">
        {PHASES.map((ph, i) => (
          <button key={ph.name} className={cur?.phase === i ? 'on' : undefined} onClick={() => onGo(ph.steps[0].node)} title={ph.goal}>
            <b>{i + 1}</b>{ph.name}
          </button>
        ))}
      </div>
      <div className="stepnav">
        <span className="pos">{cur ? `Bước ${cur.index}/${STEPS.length}` : 'Ngoài lộ trình'}</span>
        <button disabled={!prev} onClick={() => prev && onGo(prev.node)} title="Bước trước (P)">←</button>
        <button disabled={!next} onClick={() => next && onGo(next.node)} title="Bước sau (N)">→</button>
      </div>
    </div>
  )
}
