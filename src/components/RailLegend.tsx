import { RAIL_STYLES } from '../railStyle'
import type { RailKind } from '../types/railway'

const ORDER: RailKind[] = ['hsr', 'tra', 'metro', 'lrt', 'heritage']

export function RailLegend() {
  return (
    <ul className="rail-legend">
      {ORDER.map((kind) => {
        const s = RAIL_STYLES[kind]
        return (
          <li key={kind}>
            <svg width="28" height="10" aria-hidden="true">
              <line x1="0" y1="5" x2="28" y2="5" stroke={s.color} strokeWidth={s.weight} strokeDasharray={s.dashArray} />
            </svg>
            {s.label}
          </li>
        )
      })}
    </ul>
  )
}
