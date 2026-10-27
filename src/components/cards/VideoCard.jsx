import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Card } from './Card'

const src = (name) => `./media/video/${name}.mp4`
const poster = (name) => `./media/poster/${name}.jpg`

function Player({ name }) {
  const ref = useRef(null)
  const [playing, setPlaying] = useState(true)
  const [ready, setReady] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const v = ref.current
    if (!v) return undefined
    const tick = () => setProgress(v.duration ? v.currentTime / v.duration : 0)
    v.addEventListener('timeupdate', tick)
    return () => v.removeEventListener('timeupdate', tick)
  }, [])

  const toggle = () => {
    const v = ref.current
    if (v.paused) { v.play(); setPlaying(true) } else { v.pause(); setPlaying(false) }
  }
  const seek = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    const v = ref.current
    if (v.duration) v.currentTime = ((e.clientX - r.left) / r.width) * v.duration
  }

  return (
    <div className="player">
      <img className="player-backdrop" src={poster(name)} alt="" aria-hidden="true" />
      <video ref={ref} className={`player-video${ready ? ' is-ready' : ''}`} src={src(name)} poster={poster(name)}
        autoPlay muted loop playsInline preload="auto" onCanPlay={() => setReady(true)} onClick={toggle} />
      <div className="player-bar">
        <button type="button" className="player-btn" onClick={toggle} aria-label={playing ? 'Pause video' : 'Play video'}>
          {playing
            ? <svg viewBox="0 0 16 16" width="14" height="14"><path d="M4 3h3v10H4zM9 3h3v10H9z" fill="currentColor" /></svg>
            : <svg viewBox="0 0 16 16" width="14" height="14"><path d="M4 3l9 5-9 5z" fill="currentColor" /></svg>}
        </button>
        <div className="player-track" onClick={seek} role="slider" aria-label="Seek" aria-valuenow={Math.round(progress * 100)}>
          <i style={{ transform: `scaleX(${progress})` }} />
        </div>
      </div>
    </div>
  )
}

export function VideoCard({ stage }) {
  return (
    <Card className="card-video" title={`${stage.title} in operation`}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={stage.video} className="scene" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}>
          <Player name={stage.video} />
        </motion.div>
      </AnimatePresence>
    </Card>
  )
}
