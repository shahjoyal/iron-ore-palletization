import { motion } from 'framer-motion'
import { DrawingCard } from '../cards/DrawingCard'
import { VideoCard } from '../cards/VideoCard'
import { InputCard } from '../cards/InputCard'
import { Sidebar } from '../layout/Sidebar'
import { enter, leave } from './motion'

/** Each column glides in from its own side; on exit the right-hand column leaves first. */
const V = {
  root: {
    hidden: {},
    show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
    exit: {},
  },
  route: {
    hidden: { opacity: 0, x: -80 },
    show: { opacity: 1, x: 0, transition: enter() },
    exit: { opacity: 0, x: -110, transition: leave(0.16) },
  },
  inputs: {
    hidden: { opacity: 0, y: 28, scale: 0.97 },
    show: { opacity: 1, y: 0, scale: 1, transition: enter() },
    exit: { opacity: 0, scale: 0.92, y: 10, transition: leave(0.08) },
  },
  view: {
    hidden: { opacity: 0, x: 80 },
    show: { opacity: 1, x: 0, transition: enter() },
    exit: { opacity: 0, x: 110, transition: leave(0) },
  },
}

/** Input workspace: process route (left), input card (middle), drawing and footage (right). */
export function Studio({ stage, mode }) {
  return (
    <motion.div className="studio" variants={V.root} initial="hidden" animate="show" exit="exit">
      <Sidebar variants={V.route} />
      <motion.div className="center" variants={V.inputs}>
        <InputCard stage={stage} />
      </motion.div>
      <motion.div className="stack" variants={V.view}>
        <DrawingCard stage={stage} mode={mode} />
        <VideoCard stage={stage} />
      </motion.div>
    </motion.div>
  )
}
