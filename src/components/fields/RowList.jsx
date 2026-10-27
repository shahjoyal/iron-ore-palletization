import { AnimatePresence, motion } from 'framer-motion'
import { Field, InlineSlider, SelectControl } from './Field'
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
                <div className="row-card">
                  <div className="row-head">
                    <SelectControl id={`${group}-flux-type-${i}`} value={row.type} options={FLUX_OPTIONS}
                      placeholder="Select flux" onChange={(v) => update(i, { type: v })} />
                    <RemoveButton label="Remove flux" onClick={() => set(rows.filter((_, j) => j !== i))} />
                  </div>
                  <InlineSlider label="Share" min={0} max={100} step={0.1} unit="%" value={row.pct ?? ''} onChange={(v) => update(i, { pct: v })} />
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

// qty = slider maximum, gcv = [min, max] in kcal/kg; chosen to cover typical plant values.
const FUELS = [
  { value: 'Anthracite Coal', label: 'Anthracite coal', unit: 'kg/T', qty: 60, gcv: [5000, 8000] },
  { value: 'Fuel FO', label: 'Fuel oil (FO)', unit: 'litre/t', qty: 40, gcv: [9000, 11000] },
  { value: 'Gas Fuel', label: 'Gas fuel', unit: 'Nm³/t', qty: 100, gcv: [3000, 10000] },
]
const FUEL_DEFAULT = { unit: 'unit', qty: 100, gcv: [0, 11000] }

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
            const fuel = FUELS.find((f) => f.value === row.type) || FUEL_DEFAULT
            const unit = fuel.unit
            return (
              <motion.div key={row._id ?? i} className="row-clip" {...rowMotion}>
                <div className="row-card">
                  <div className="row-head">
                    <SelectControl id={`feed-fuel-type-${i}`} value={row.type} options={FUELS}
                      placeholder="Select fuel" onChange={(v) => update(i, { type: v })} />
                    <RemoveButton label="Remove fuel" onClick={() => set(rows.filter((_, j) => j !== i))} />
                  </div>
                  <InlineSlider label="Quantity" min={0} max={fuel.qty} step={0.1} unit={unit} value={row.qty ?? ''} onChange={(v) => update(i, { qty: v })} />
                  <InlineSlider label="GCV" min={fuel.gcv[0]} max={fuel.gcv[1]} step={10} unit="kcal/kg" value={row.gcv ?? ''} onChange={(v) => update(i, { gcv: v })} />
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
