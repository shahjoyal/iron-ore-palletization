import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Card } from './Card'
import { StageForm } from '../stages'
import { STAGES } from '../../data/stages'
import { useSimStore } from '../../store/useSimStore'
import { emitTouch } from '../../lib/bus'

const Check = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
    <motion.path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.35 }} />
  </svg>
)

export function InputCard({ stage, sizeToggle }) {
  const { saved, saveStage, step, runSimulation } = useSimStore()
  const [justSaved, setJustSaved] = useState(false)
  const pos = STAGES.findIndex((s) => s.id === stage.id)
  const last = pos === STAGES.length - 1
  const isSaved = !!saved[stage.id]

  const save = (then) => {
    saveStage(stage.id)
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 1500)
    if (then) setTimeout(then, 750)
  }

  return (
    <Card className="card-input" title={stage.title}
      meta={
        <>
          <span className="step-count">Stage {pos + 1} of {STAGES.length}</span>
          {sizeToggle && (
            <button type="button" className={`size-toggle${sizeToggle.max ? ' is-max' : ''}`} onClick={sizeToggle.onToggle}
              aria-pressed={sizeToggle.max} aria-label={sizeToggle.max ? 'Minimise inputs' : 'Maximise inputs'}
              title={sizeToggle.max ? 'Minimise' : 'Maximise'}>
              <span aria-hidden="true"><i /><i /><i /></span>
            </button>
          )}
        </>
      }
      footer={
        <div className="actions">
          <button type="button" className="btn btn-ghost" disabled={pos === 0} onClick={() => step(-1)}>Back</button>
          <div className="actions-right">
            <button type="button" className={`btn btn-secondary${justSaved ? ' is-saved' : ''}`} onClick={() => save()}>
              {justSaved ? <><Check /> Saved</> : isSaved ? 'Update' : 'Save'}
            </button>
            <button type="button" className="btn btn-primary"
              onClick={() => save(last ? runSimulation : () => step(1))}>
              {last ? 'Save and run simulation' : 'Save and continue'}
            </button>
          </div>
        </div>
      }>
      <p className="card-lede">{stage.blurb}</p>
      <div className="form-scroll" onInputCapture={emitTouch} onChangeCapture={emitTouch}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={stage.id} className="form" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}>
            <StageForm stage={stage} />
          </motion.div>
        </AnimatePresence>
      </div>
    </Card>
  )
}
