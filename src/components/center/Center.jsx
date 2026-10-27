import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { InputCard } from '../cards/InputCard'
import { RunCard } from './RunCard'
import { OutputCard } from './OutputCard'
import { InputsHandle } from './InputsHandle'
import { useSimStore } from '../../store/useSimStore'

const ease = [0.22, 1, 0.36, 1]

/** Each phase enters and leaves differently, so the hand-off reads as one motion. */
const PHASE = {
  inputs: {
    initial: { opacity: 0, y: 18, scale: 0.985 },
    animate: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', transition: { duration: 0.5, ease, delay: 0.2 } },
    exit: { opacity: 0, x: -64, scale: 0.92, filter: 'blur(10px)', transition: { duration: 0.5, ease } },
  },
  running: {
    initial: { opacity: 0, scale: 0.9, filter: 'blur(6px)' },
    animate: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 0.45, ease, delay: 0.1 } },
    exit: { opacity: 0, scale: 1.06, filter: 'blur(10px)', transition: { duration: 0.4, ease } },
  },
  results: {
    initial: { opacity: 0, x: 64, scale: 0.97 },
    animate: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.6, ease, delay: 0.05 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  },
}

export function Center({ stage }) {
  const phase = useSimStore((s) => s.phase)
  const pinned = useSimStore((s) => s.drawerOpen)
  const setDrawer = useSimStore((s) => s.setDrawer)
  const [hover, setHover] = useState(false)
  const timer = useRef(0)
  const open = phase === 'results' && (pinned || hover)

  const later = (fn, ms) => { clearTimeout(timer.current); timer.current = setTimeout(fn, ms) }
  const closeAll = () => { clearTimeout(timer.current); setHover(false); setDrawer(false) }

  // Hover reveals the inputs after a short intent delay and hides them on leave;
  // a click pins them open until the handle is clicked again, Esc, or "Hide inputs".
  const onHandleEnter = () => later(() => setHover(true), 110)
  const onHandleClick = () => {
    clearTimeout(timer.current)
    if (pinned) closeAll()
    else { setHover(false); setDrawer(true) }
  }
  const onLeave = () => { if (!pinned) later(() => setHover(false), 320) }
  const onEnter = () => clearTimeout(timer.current)

  useEffect(() => {
    if (!open) return undefined
    const key = (e) => e.key === 'Escape' && closeAll()
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (phase !== 'results') setHover(false) }, [phase])

  const v = PHASE[phase]
  return (
    <div className="center" onPointerLeave={onLeave} onPointerEnter={onEnter}>
      <AnimatePresence mode="wait" initial>
        <motion.div key={phase} className="center-layer" initial={v.initial} animate={v.animate} exit={v.exit}>
          {phase === 'inputs' && <InputCard stage={stage} index={2} layered />}
          {phase === 'running' && <RunCard />}
          {phase === 'results' && <OutputCard onEdit={() => setDrawer(true)} />}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {phase === 'results' && (
          <InputsHandle key="handle" open={open} onEnter={onHandleEnter} onClick={onHandleClick} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div key="drawer" className="drawer"
            initial={{ opacity: 0, x: -44, scale: 0.96, filter: 'blur(8px)' }}
            animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -44, scale: 0.96, filter: 'blur(8px)' }}
            transition={{ duration: 0.42, ease }}>
            <InputCard stage={stage} inDrawer onClose={closeAll} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
