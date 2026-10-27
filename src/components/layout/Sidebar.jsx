import { AnimatePresence, motion } from 'framer-motion'
import { STAGES, stageView } from '../../data/stages'
import { useSimStore, stageStatus } from '../../store/useSimStore'

const tick = (
  <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
    <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export function Sidebar({ variants }) {
  const { active, goTo, saved, params, phase, runStep, runSimulation, reset } = useSimStore()
  const running = phase === 'running'
  const savedCount = STAGES.filter((s) => saved[s.id]).length
  const pct = (savedCount / STAGES.length) * 100

  return (
    <motion.aside className="sidebar" variants={variants} aria-label="Process stages">
      <div className="sidebar-inner">
        <div className="sidebar-head">
          <h2>Process route</h2>
          <span className="mono">{savedCount}/{STAGES.length} saved</span>
        </div>
        <div className="progress"><motion.i animate={{ width: `${pct}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} /></div>

        <ol className="stage-list">
          {STAGES.map((base, i) => {
            const s = stageView(base, params)
            const status = stageStatus(s.id, saved, params)
            const isActive = active === s.id
            const sweeping = running && runStep === i
            return (
              <li key={s.id} className={`stage-item status-${status}${isActive ? ' is-active' : ''}${sweeping ? ' is-sweeping' : ''}`}>
                <button type="button" onClick={() => goTo(s.id)} aria-current={isActive ? 'step' : undefined}>
                  {isActive && <motion.span layoutId="active-pill" className="active-pill"
                    transition={{ type: 'spring', stiffness: 420, damping: 38 }} />}
                  <span className="node">
                    <AnimatePresence mode="wait" initial={false}>
                      {status === 'saved'
                        ? <motion.span key="ok" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>{tick}</motion.span>
                        : <motion.span key="n" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mono">{i + 1}</motion.span>}
                    </AnimatePresence>
                  </span>
                  <span className="stage-text">
                    <span className="stage-name">{s.title}</span>
                    <AnimatePresence initial={false}>
                      {isActive && (
                        <motion.span className="stage-blurb" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }}>{s.blurb}</motion.span>
                      )}
                    </AnimatePresence>
                  </span>
                  {status === 'draft' && <span className="draft-dot" title="Unsaved changes" />}
                </button>
              </li>
            )
          })}
        </ol>

        <div className="sidebar-foot">
          <button type="button" className="btn btn-run" onClick={runSimulation} disabled={running}>
            {running ? 'Running…' : phase === 'results' ? 'Run again' : 'Run simulation'}
          </button>
          <button type="button" className="btn btn-quiet" onClick={reset}>Reset</button>
        </div>
      </div>
    </motion.aside>
  )
}
