import { motion } from 'framer-motion'
import { RouteBar } from './RouteBar'
import { OutputCard } from './OutputCard'
import { InputCard } from '../cards/InputCard'
import { useSimStore } from '../../store/useSimStore'
import { enter, leave } from './motion'

const V = {
  root: { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } }, exit: {} },
  panel: {
    hidden: { opacity: 0, x: -70 },
    show: { opacity: 1, x: 0, transition: enter() },
    exit: { opacity: 0, x: -90, transition: leave(0.08) },
  },
  output: {
    hidden: { opacity: 0, x: 70, scale: 0.985 },
    show: { opacity: 1, x: 0, scale: 1, transition: enter(0.7) },
    exit: { opacity: 0, scale: 0.98, transition: leave(0) },
  },
}

/** After a run: compact route + inputs on the left, full output on the right. */
export function Results({ stage }) {
  const max = useSimStore((s) => s.panelMax)
  const toggle = useSimStore((s) => s.togglePanel)
  return (
    <motion.div className="results" variants={V.root} initial="hidden" animate="show" exit="exit">
      <motion.div className={`panel${max ? ' is-max' : ''}`} variants={V.panel}>
        <RouteBar />
        <InputCard stage={stage} sizeToggle={{ max, onToggle: toggle }} />
      </motion.div>
      <motion.div className="output" variants={V.output}>
        <OutputCard />
      </motion.div>
    </motion.div>
  )
}
