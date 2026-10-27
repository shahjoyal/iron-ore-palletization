import { useSimStore } from '../../store/useSimStore'

const outOfRange = (v, min, max) => {
  if (v === '' || v === undefined) return false
  const n = Number(v)
  return Number.isFinite(n) && (n < min || n > max)
}

export function Field({ label, hint, warn, children, htmlFor }) {
  return (
    <div className={`field${warn ? ' is-warn' : ''}`}>
      <label className="field-label" htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && <div className="field-hint">{hint}</div>}
    </div>
  )
}

const decimals = (step) => (String(step).split('.')[1] || '').length

/**
 * Percentage fields: label, slider and live value on one line (no input box).
 * A hidden input with the original id keeps the drawing routines, which read
 * their values from the DOM by id, working unchanged.
 */
function SliderField({ field }) {
  const { group, key, id, label, min, max, step, unit, hint } = field
  const value = useSimStore((s) => s.params[group][key])
  const setParam = useSimStore((s) => s.setParam)
  const empty = value === '' || value === undefined
  const n = empty ? min : Math.min(max, Math.max(min, Number(value)))
  const pct = ((n - min) / (max - min)) * 100
  const claim = () => { if (empty) setParam(group, key, String(min)) }
  return (
    <div className="field field-inline" title={hint || `Range: ${min} – ${max}${unit}`}>
      <label className="field-label" htmlFor={`${id}-slider`}>{label}</label>
      <div className={`slider${empty ? ' is-empty' : ''}`} style={{ '--pct': `${pct}%` }}>
        <input id={`${id}-slider`} type="range" className="slider-range" min={min} max={max} step={step} value={n}
          onPointerDown={claim} onKeyDown={claim}
          onChange={(e) => setParam(group, key, Number(e.target.value).toFixed(decimals(step)))} />
        <div className="slider-scale mono" aria-hidden="true"><span>{min}</span><span>{max}</span></div>
      </div>
      <span className="slider-value mono">{empty ? '—' : value}<small>{unit}</small></span>
      <input id={id} type="hidden" value={value} readOnly />
    </div>
  )
}

export function NumberField({ field }) {
  if (field.unit === '%') return <SliderField field={field} />
  const { group, key, id, label, min, max, step, unit, hint } = field
  const value = useSimStore((s) => s.params[group][key])
  const setParam = useSimStore((s) => s.setParam)
  const warn = outOfRange(value, min, max)
  const range = `${min} – ${max}${unit ? ` ${unit}` : ''}`
  return (
    <Field label={label} htmlFor={id} warn={warn}
      hint={warn ? `Outside the usual range (${range})` : hint || `Range: ${range}`}>
      <div className="input-wrap">
        <input id={id} className="input mono" type="number" inputMode="decimal" min={min} max={max} step={step}
          placeholder={`${min} – ${max}`} value={value} onChange={(e) => setParam(group, key, e.target.value)} />
        {unit && <span className="input-unit">{unit}</span>}
      </div>
    </Field>
  )
}

export function SelectControl({ id, value, onChange, options, placeholder = 'Select…' }) {
  return (
    <div className="select-wrap">
      <select id={id} className="input select" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{placeholder}</option>
        {options.map((o) => {
          const opt = typeof o === 'string' ? { value: o, label: o } : o
          return <option key={opt.value} value={opt.value}>{opt.label}</option>
        })}
      </select>
    </div>
  )
}

export function SelectField({ field }) {
  const { group, key, id, label, options, hint } = field
  const value = useSimStore((s) => s.params[group][key])
  const setParam = useSimStore((s) => s.setParam)
  return (
    <Field label={label} htmlFor={id} hint={hint}>
      <SelectControl id={id} value={value} options={options} onChange={(v) => setParam(group, key, v)} />
    </Field>
  )
}

export function NumberUnitField({ field }) {
  const { group, key, unitKey, id, unitId, label, units, hint } = field
  const value = useSimStore((s) => s.params[group][key])
  const unit = useSimStore((s) => s.params[group][unitKey])
  const setParam = useSimStore((s) => s.setParam)
  return (
    <Field label={label} htmlFor={id} hint={hint}>
      <div className="input-row">
        <input id={id} className="input mono" type="number" min={0} step={0.1} placeholder="Enter value"
          value={value} onChange={(e) => setParam(group, key, e.target.value)} />
        <div className="select-wrap select-narrow">
          <select id={unitId} className="input select" value={unit} onChange={(e) => setParam(group, unitKey, e.target.value)}>
            {units.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>
    </Field>
  )
}

export function renderField(field) {
  const props = { key: field.id, field }
  if (field.type === 'select') return <SelectField {...props} />
  if (field.type === 'numberUnit') return <NumberUnitField {...props} />
  return <NumberField {...props} />
}
