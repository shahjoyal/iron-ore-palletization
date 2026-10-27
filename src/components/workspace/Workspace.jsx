import { AnimatePresence, motion } from 'framer-motion'
import { Studio } from './Studio'
import { Results } from './Results'
import { RunCard } from './RunCard'
import { useSimStore } from '../../store/useSimStore'
import { enter } from './motion'

/**
 * One area, three phases, shown one at a time (the previous one leaves first):
 *   inputs   - process route | inputs | drawing + footage
 *   running  - loading card
 *   results  - compact route + inputs | output
 */
export function Workspace({ stage, mode }) {
  const phase = useSimStore((s) => s.phase)
  return (
    <main className="workspace">
      <AnimatePresence mode="wait">
        {phase === 'inputs' && <Studio key="inputs" stage={stage} mode={mode} />}
        {phase === 'running' && (
          <motion.div key="running" className="run-layer"
            initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1, transition: enter(0.5) }}
            exit={{ opacity: 0, scale: 1.05, transition: { duration: 0.35 } }}>
            <RunCard />
          </motion.div>
        )}
        {phase === 'results' && <Results key="results" stage={stage} />}
      </AnimatePresence>
    </main>
  )
}
