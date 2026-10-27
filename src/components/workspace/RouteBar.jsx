import { useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { STAGES, stageView } from '../../data/stages'
import { useSimStore } from '../../store/useSimStore'

const Arrow = ({ dir }) => (
  <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
    <path d={dir < 0 ? 'M10 3L5 8l5 5' : 'M6 3l5 5-5 5'} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/** The process route, shrunk to a heading with previous / next arrows. */
export function RouteBar() {
  const active = useSimStore((s) => s.active)
  const params = useSimStore((s) => s.params)
  const step = useSimStore((s) => s.step)
  const i = STAGES.findIndex((s) => s.id === active)
  const stage = stageView(STAGES[i], params)
  const prev = useRef(i)
  const dir = i >= prev.current ? 1 : -1
  prev.current = i

  return (
    <nav className="route-bar" aria-label="Process route">
      <button type="button" className="route-arrow" disabled={i === 0} onClick={() => step(-1)} aria-label="Previous stage"><Arrow dir={-1} /></button>
      <div className="route-text">
        <span className="route-caption">Process route <b className="mono">{i + 1}/{STAGES.length}</b></span>
        <div className="route-title-clip">
          <AnimatePresence mode="popLayout" initial={false} custom={dir}>
            <motion.strong key={stage.id} className="route-title" custom={dir}
              variants={{ in: (d) => ({ opacity: 0, y: d * 16 }), on: { opacity: 1, y: 0 }, out: (d) => ({ opacity: 0, y: d * -16 }) }}
              initial="in" animate="on" exit="out" transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
              {stage.title}
            </motion.strong>
          </AnimatePresence>
        </div>
      </div>
      <button type="button" className="route-arrow" disabled={i === STAGES.length - 1} onClick={() => step(1)} aria-label="Next stage"><Arrow dir={1} /></button>
    </nav>
  )
}
