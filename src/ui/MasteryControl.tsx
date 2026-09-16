import { LEVELS, levelLabel } from '../store/progress'

interface Props { value: number; onChange: (v: number) => void; compact?: boolean; disabled?: boolean }

/** Chọn mức nắm vững: 5 mốc có nghĩa + thanh trượt để tinh chỉnh */
export function MasteryControl({ value, onChange, compact, disabled }: Props) {
  return (
    <div className={'mastery' + (compact ? ' compact' : '') + (value >= 100 ? ' full' : '')}>
      <div className="chips" role="radiogroup" aria-label="Mức nắm vững">
        {LEVELS.map(l => (
          <button key={l.value} role="radio" aria-checked={value === l.value} className={value === l.value ? 'on' : value > l.value ? 'passed' : undefined}
            disabled={disabled} title={`${l.value}% · ${l.hint}`} onClick={() => onChange(l.value)}>
            <b>{l.value}</b>{!compact && <span>{l.label}</span>}
          </button>
        ))}
      </div>
      {!compact && (
        <label className="slider">
          <input type="range" min={0} max={100} step={5} value={value} disabled={disabled} onChange={e => onChange(Number(e.target.value))} aria-label="Tinh chỉnh phần trăm" />
          <output>{value}% · {levelLabel(value)}</output>
        </label>
      )}
    </div>
  )
}

/** Thanh tiến độ nhỏ dùng khắp nơi */
export function Bar({ value, color, thin }: { value: number; color?: string; thin?: boolean }) {
  return <span className={'meter' + (thin ? ' thin' : '') + (value >= 1 ? ' full' : '')} style={color ? { '--lc': color } as React.CSSProperties : undefined}><i style={{ width: `${Math.round(value * 100)}%` }} /></span>
}

export const WeightDots = ({ w }: { w: number }) => <span className="wdots" title={`Trọng số ${w}/5`}>{[1, 2, 3, 4, 5].map(i => <i key={i} className={i <= w ? 'on' : undefined} />)}</span>
