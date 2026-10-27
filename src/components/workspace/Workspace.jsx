import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Studio } from './Studio'
import { Results } from './Results'
import { RunCard } from './RunCard'
import { useSimStore } from '../../store/useSimStore'
import { enter } from './motion'

// How long each view needs to finish its exit animation before the next one mounts.
const EXIT_MS = { inputs: 800, running: 400, results: 700 }

const RUN = {
  hidden: { opacity: 0, scale: 0.92 },
  show: { opacity: 1, scale: 1, transition: enter(0.5) },
  exit: { opacity: 0, scale: 1.05, transition: { duration: 0.35 } },
}

/**
 * One area, three phases, shown one at a time:
 *   inputs   - process route | inputs | drawing + footage
 *   running  - loading card
 *   results  - compact route + inputs | output
 *
 * The hand-off is sequenced here rather than with AnimatePresence: the current
 * view animates out, and the next one mounts once that has finished. (Nested
 * AnimatePresence blocks inside the forms could otherwise stall an exit and
 * leave a blank screen.)
 */
export function Workspace({ stage, mode }) {
  const phase = useSimStore((s) => s.phase)
  const [shown, setShown] = useState(phase)
  const leaving = phase !== shown

  useEffect(() => {
    if (phase === shown) return undefined
    const t = setTimeout(() => setShown(phase), EXIT_MS[shown])
    return () => clearTimeout(t)
  }, [phase, shown])

  return (
    <main className="workspace">
      {shown === 'inputs' && <Studio key="inputs" stage={stage} mode={mode} leaving={leaving} />}
      {shown === 'running' && (
        <motion.div key="running" className="run-layer" variants={RUN} initial="hidden" animate={leaving ? 'exit' : 'show'}>
          <RunCard />
        </motion.div>
      )}
      {shown === 'results' && <Results key="results" stage={stage} leaving={leaving} />}
    </main>
  )
}
