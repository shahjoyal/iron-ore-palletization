import { AnimatePresence, motion } from 'framer-motion'
import { Field, SelectControl } from './Field'
import { useSimStore } from '../../store/useSimStore'

const rowMotion = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: 'auto' },
  exit: { opacity: 0, height: 0 },
  transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
}

function RemoveButton({ onClick, label }) {
  return (
    <button type="button" className="icon-btn" onClick={onClick} aria-label={label}>
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
    </button>
  )
}

const FLUX_OPTIONS = ['Limestone', 'Dolomite', 'Pyroxenite']
let rowId = 0
const newRow = (row) => ({ ...row, _id: `r${++rowId}-${Date.now().toString(36)}` })

/** Flux / additive rows (type + percentage). Used by Feed and Mixing. */
export function FluxList({ group }) {
  const rows = useSimStore((s) => s.params[group].fluxes)
  const patchGroup = useSimStore((s) => s.patchGroup)
  const set = (next) => patchGroup(group, { fluxes: next })
  const update = (i, patch) => set(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)))
  return (
    <Field label="Flux / additive (one or more)">
      <div className="row-list">
        <AnimatePresence initial={false}>
          {rows.map((r, i) => {
            const row = r
            return (
              <motion.div key={row._id ?? i} className="row-clip" {...rowMotion}>
                <div className="row-item flux-row">
                  <SelectControl id={`${group}-flux-type-${i}`} value={row.type} options={FLUX_OPTIONS}
                    placeholder="Select flux" onChange={(v) => update(i, { type: v })} />
                  <div className="input-wrap flux-pct">
                    <input className="input mono" type="number" min={0} max={100} step={0.1} placeholder="0"
                      aria-label="Flux percentage" value={row.pct ?? ''} onChange={(e) => update(i, { pct: e.target.value })} />
                    <span className="input-unit">%</span>
                  </div>
                  <RemoveButton label="Remove flux" onClick={() => set(rows.filter((_, j) => j !== i))} />
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
        <button type="button" className="btn-add" onClick={() => set([...rows, newRow({ type: '', pct: '' })])}>
          <span aria-hidden="true">+</span> Add flux or additive
        </button>
      </div>
    </Field>
  )
}

const FUELS = [
  { value: 'Anthracite Coal', label: 'Anthracite coal', unit: 'kg/T' },
  { value: 'Fuel FO', label: 'Fuel oil (FO)', unit: 'litre/t' },
  { value: 'Gas Fuel', label: 'Gas fuel', unit: 'Nm³/t' },
]

/** Fuel / reductant rows (type, quantity, GCV). */
export function FuelList() {
  const rows = useSimStore((s) => s.params.feed.fuels)
  const patchGroup = useSimStore((s) => s.patchGroup)
  const set = (next) => patchGroup('feed', { fuels: next })
  const update = (i, patch) => set(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)))
  return (
    <Field label="Fuel / reductant">
      <div className="row-list">
        <AnimatePresence initial={false}>
          {rows.map((r, i) => {
            const row = r
            const unit = FUELS.find((f) => f.value === row.type)?.unit || 'unit'
            return (
              <motion.div key={row._id ?? i} className="row-clip" {...rowMotion}>
                <div className="row-item fuel-row">
                  <div className="fuel-head">
                    <SelectControl id={`feed-fuel-type-${i}`} value={row.type} options={FUELS}
                      placeholder="Select fuel" onChange={(v) => update(i, { type: v })} />
                    <RemoveButton label="Remove fuel" onClick={() => set(rows.filter((_, j) => j !== i))} />
                  </div>
                  <div className="field-grid">
                    <label className="mini-field">
                      <span>Quantity ({unit})</span>
                      <input className="input mono" type="number" min={0} step={0.01} placeholder="0.00"
                        value={row.qty ?? ''} onChange={(e) => update(i, { qty: e.target.value })} />
                    </label>
                    <label className="mini-field">
                      <span>GCV (kcal/kg)</span>
                      <input className="input mono" type="number" min={0} step={1} placeholder="0"
                        value={row.gcv ?? ''} onChange={(e) => update(i, { gcv: e.target.value })} />
                    </label>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
        <button type="button" className="btn-add" onClick={() => set([...rows, newRow({ type: '', qty: '', gcv: '' })])}>
          <span aria-hidden="true">+</span> Add fuel or reductant
        </button>
      </div>
    </Field>
  )
}
