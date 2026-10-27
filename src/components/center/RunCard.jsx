import { AnimatePresence, motion } from 'framer-motion'
import { Card } from '../cards/Card'
import { STAGES, stageView } from '../../data/stages'
import { useSimStore } from '../../store/useSimStore'

const R = 54
const CIRC = 2 * Math.PI * R

/** Loading state while the simulation walks the process route. */
export function RunCard() {
  const runStep = useSimStore((s) => s.runStep)
  const params = useSimStore((s) => s.params)
  const i = Math.max(0, runStep)
  const total = STAGES.length
  const current = stageView(STAGES[i], params)
  const progress = (i + 1) / total

  return (
    <Card animateIn={false} className="card-run" title="Running simulation">
      <div className="run-body">
        <div className="ring">
          <svg viewBox="0 0 130 130" width="150" height="150" aria-hidden="true">
            <circle cx="65" cy="65" r={R} className="ring-bg" />
            <motion.circle cx="65" cy="65" r={R} className="ring-fg" strokeDasharray={CIRC}
              initial={{ strokeDashoffset: CIRC }} animate={{ strokeDashoffset: CIRC * (1 - progress) }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} />
          </svg>
          <div className="dots" aria-hidden="true"><i /><i /><i /></div>
        </div>

        <div className="run-text" role="status" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={current.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}>
              <strong>{current.title}</strong>
              <span className="mono">Stage {i + 1} of {total}</span>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="run-steps" aria-hidden="true">
          {STAGES.map((s, k) => <i key={s.id} className={k <= i ? 'on' : ''} />)}
        </div>
      </div>
    </Card>
  )
}
