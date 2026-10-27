import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Card } from './Card'
import { SCENES } from '../../scenes'
import { buildFurnaceSVG, buildKilnSVG } from '../../scenes/induSvg'
import { useScene } from '../../hooks/useScene'
import { useSimStore } from '../../store/useSimStore'

const Meter = ({ label, id, start = 0 }) => (
  <div className="meter">
    <span className="meter-label">{label}</span>
    <div className="meter-track"><i id={id} style={{ width: `${start}%` }} /></div>
  </div>
)
const Stat = ({ label, id }) => (
  <div className="stat"><span className="stat-label">{label}</span><span className="stat-val mono" id={id}>—</span></div>
)

/** Footer readouts the drawing routines write into by element id. */
function Footer({ id }) {
  switch (id) {
    case 'feed': return <Meter label="Feed rate" id="feedMeterFill" />
    case 'grind': return <Meter label="Mill speed" id="grindRpmFill" />
    case 'thickner': return <Meter label="Underflow density" id="thickDensityFill" />
    case 'filter': return <Meter label="Cake moisture" id="filterMoistureFill" />
    case 'mix': return <Meter label="Shaft rotation" id="mixShaftFill" start={50} />
    case 'ball': return <Meter label="Disc setting" id="ballDiscBarFill" />
    case 'greenball':
      return (
        <div className="stat-row">
          <Stat label="Moisture" id="gbStatMoist" /><Stat label="Drop no." id="gbStatDrop" />
          <Stat label="GCS" id="gbStatGcs" /><Stat label="Recycle" id="gbStatSize" />
        </div>
      )
    case 'cool':
      return <div className="stat-row"><Stat label="Inlet" id="coolStatIn" /><Stat label="Exit" id="coolStatOut" /></div>
    default: return null
  }
}

function CanvasScene({ stageId }) {
  const { canvasRef, sceneRef } = useScene(SCENES[stageId])
  const saveTick = useSimStore((s) => s.saveTick)
  const first = useRef(saveTick)
  useEffect(() => {
    if (saveTick !== first.current) sceneRef.current?.burst?.()
  }, [saveTick, sceneRef])
  return (
    <>
      <div className="canvas-wrap">
        <canvas ref={canvasRef} className="scene-canvas" />
        {stageId === 'greenball' && <div id="gbHintLabel" className="canvas-hint">Enter any value to start the belt</div>}
      </div>
      <Footer id={stageId} />
    </>
  )
}

function InduScene({ mode }) {
  return (
    <div className="svg-wrap"
      dangerouslySetInnerHTML={{ __html: mode === 'grate' ? buildKilnSVG() : buildFurnaceSVG() }} />
  )
}

export function DrawingCard({ stage, mode }) {
  const saveTick = useSimStore((s) => s.saveTick)
  return (
    <Card className="card-drawing" title={stage.drawing}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={stage.id === 'indu' ? `indu-${mode}` : stage.id} className="scene"
          initial={{ opacity: 0, scale: 0.985 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
          {stage.id === 'indu' ? <InduScene mode={mode} /> : <CanvasScene stageId={stage.id} />}
        </motion.div>
      </AnimatePresence>
      <AnimatePresence>
        {saveTick > 0 && (
          <motion.div key={saveTick} className="saved-flash" aria-hidden="true"
            initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: [0, 1, 1, 0], scale: [0.7, 1, 1, 1.05] }}
            transition={{ duration: 1.3, times: [0, 0.18, 0.7, 1] }}>
            <svg viewBox="0 0 24 24" width="28" height="28"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Saved
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}
