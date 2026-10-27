import { useEffect, useRef } from 'react'
import { animate, motion } from 'framer-motion'
import { Card } from '../cards/Card'
import { useSimStore } from '../../store/useSimStore'

const ease = [0.22, 1, 0.36, 1]
const rise = (i) => ({
  initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease, delay: 0.25 + i * 0.09 },
})

function CountUp({ value, decimals = 1, delay = 0.35 }) {
  const ref = useRef(null)
  useEffect(() => {
    const c = animate(0, value, {
      duration: 1.4, ease, delay,
      onUpdate: (v) => { if (ref.current) ref.current.textContent = v.toFixed(decimals) },
    })
    return () => c.stop()
  }, [value, decimals, delay])
  return <span ref={ref}>{(0).toFixed(decimals)}</span>
}

function Kpi({ k, i }) {
  return (
    <motion.div className="kpi" {...rise(i)}>
      <span className="kpi-label">{k.label}</span>
      <div className="kpi-value mono"><CountUp value={k.value} decimals={k.decimals} /><small>{k.unit}</small></div>
      <span className="kpi-target">{k.target}</span>
    </motion.div>
  )
}

function SizeBars({ sizes }) {
  const top = Math.max(...sizes.map((s) => s.value))
  return (
    <div className="bars">
      {sizes.map((s, i) => (
        <div className="bar-row" key={s.label}>
          <span className="bar-label">{s.label}</span>
          <div className="bar-track">
            <motion.i initial={{ width: 0 }} animate={{ width: `${(s.value / top) * 100}%` }}
              transition={{ duration: 0.9, ease, delay: 0.6 + i * 0.1 }} />
          </div>
          <span className="bar-val mono"><CountUp value={s.value} decimals={1} delay={0.6 + i * 0.1} />%</span>
        </div>
      ))}
    </div>
  )
}

function Gauge({ g, i }) {
  const pos = (v) => `${((Math.min(g.max, Math.max(g.min, v)) - g.min) / (g.max - g.min)) * 100}%`
  const ok = g.value >= g.from && g.value <= g.to
  return (
    <motion.div className="gauge" {...rise(i)}>
      <div className="gauge-head">
        <span>{g.label}</span>
        <span className={`chip ${ok ? 'ok' : 'check'}`}>{ok ? 'On target' : 'Check'}</span>
      </div>
      <div className="gauge-track">
        <i className="gauge-band" style={{ left: pos(g.from), width: `calc(${pos(g.to)} - ${pos(g.from)})` }} />
        <motion.b className="gauge-mark" initial={{ left: '0%', opacity: 0 }} animate={{ left: pos(g.value), opacity: 1 }}
          transition={{ duration: 1.1, ease, delay: 0.8 + i * 0.12 }} />
      </div>
      <div className="gauge-foot mono">
        <span>{g.min}</span>
        <strong><CountUp value={g.value} decimals={g.decimals} delay={0.8 + i * 0.12} /> {g.unit}</strong>
        <span>{g.max}</span>
      </div>
    </motion.div>
  )
}

const SUMMARY = [
  ['size', 'Pellet size'], ['binder', 'OB / binder'], ['yield', 'Yield est.'],
  ['basicity', 'Basicity'], ['temp', 'Induration'], ['moisture', 'Moisture'],
]

export function OutputCard({ onEdit }) {
  const results = useSimStore((s) => s.results)
  const summary = useSimStore((s) => s.summary)
  const run = useSimStore((s) => s.runSimulation)
  if (!results) return null
  return (
    <Card animateIn={false} className="card-output" title="Finished pellets"
      meta={<span className="chip ok">Simulation complete</span>}
      footer={
        <div className="actions">
          <button type="button" className="btn btn-ghost" onClick={onEdit}>Edit inputs</button>
          <button type="button" className="btn btn-primary" onClick={run}>Run again</button>
        </div>
      }>
      <div className="out-scroll">
        <p className="card-lede out-lede">Predicted quality of the finished pellets for the settings you entered.</p>

        <section className="out-section">
          <div className="kpi-row">{results.kpis.map((k, i) => <Kpi key={k.key} k={k} i={i} />)}</div>
        </section>

        <section className="out-section">
          <h3 className="form-section-title">Size distribution</h3>
          <SizeBars sizes={results.sizes} />
        </section>

        <section className="out-section">
          <h3 className="form-section-title">Quality indices</h3>
          <div className="gauge-grid">{results.gauges.map((g, i) => <Gauge key={g.key} g={g} i={i} />)}</div>
        </section>

        {summary && (
          <section className="out-section">
            <h3 className="form-section-title">Process summary</h3>
            <div className="sum-grid">
              {SUMMARY.map(([key, label], i) => (
                <motion.div key={key} className="sum-tile" {...rise(i * 0.4)}>
                  <span>{label}</span>
                  <strong className={`mono${key === 'binder' ? (summary.binderOk ? ' good' : ' warn') : ''}`}>{summary[key]}</strong>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        <p className="out-note">Preview values: these results are placeholders until the process model is connected.</p>
      </div>
    </Card>
  )
}
