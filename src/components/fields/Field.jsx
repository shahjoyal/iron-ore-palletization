import { useSimStore } from '../../store/useSimStore'

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
 * One-line slider: label, slider and live value (no input box).
 * When `id` is given, a hidden input with that id mirrors the value, because the
 * drawing routines read their inputs from the DOM by id.
 */
export function InlineSlider({ label, value, onChange, min, max, step, unit, unitSlot, id, hint, className = '' }) {
  const empty = value === '' || value === undefined || value === null
  const n = empty ? min : Math.min(max, Math.max(min, Number(value)))
  const pct = max === min ? 0 : ((n - min) / (max - min)) * 100
  const claim = () => { if (empty) onChange(String(min)) }
  const sliderId = id ? `${id}-slider` : undefined
  return (
    <div className={`field field-inline ${className}`} title={hint || `Range: ${min} – ${max}${unit || ''}`}>
      <label className="field-label" htmlFor={sliderId}>{label}</label>
      <div className={`slider${empty ? ' is-empty' : ''}`} style={{ '--pct': `${pct}%` }}>
        <input id={sliderId} type="range" className="slider-range" min={min} max={max} step={step} value={n}
          aria-label={label} onPointerDown={claim} onKeyDown={claim}
          onChange={(e) => onChange(Number(e.target.value).toFixed(decimals(step)))} />
        <div className="slider-scale mono" aria-hidden="true"><span>{min}</span><span>{max}</span></div>
      </div>
      <span className="slider-value mono">{empty ? '—' : value}{unitSlot || (unit && <small>{unit}</small>)}</span>
      {id && <input id={id} type="hidden" value={value ?? ''} readOnly />}
    </div>
  )
}

/** A numeric stage field, bound to the store. */
export function NumberField({ field }) {
  const { group, key, id, label, min, max, step, unit, hint } = field
  const value = useSimStore((s) => s.params[group][key])
  const setParam = useSimStore((s) => s.setParam)
  return <InlineSlider id={id} label={label} min={min} max={max} step={step} unit={unit} hint={hint}
    value={value} onChange={(v) => setParam(group, key, v)} />
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

/** Slider whose unit can be switched (the range follows the unit). */
export function NumberUnitField({ field }) {
  const { group, key, unitKey, id, unitId, label, units, ranges, hint } = field
  const value = useSimStore((s) => s.params[group][key])
  const unit = useSimStore((s) => s.params[group][unitKey])
  const setParam = useSimStore((s) => s.setParam)
  const [min, max, step] = ranges[unit] || ranges[units[0]]
  return (
    <InlineSlider id={id} label={label} hint={hint} min={min} max={max} step={step}
      value={value} onChange={(v) => setParam(group, key, v)}
      unitSlot={<UnitSelect id={unitId} value={unit} units={units} onChange={(u) => setParam(group, unitKey, u)} />} />
  )
}

export function UnitSelect({ id, value, units, onChange }) {
  return (
    <select id={id} className="unit-select mono" value={value} aria-label="Unit" onChange={(e) => onChange(e.target.value)}>
      {units.map((u) => <option key={u.value ?? u} value={u.value ?? u}>{u.label ?? u}</option>)}
    </select>
  )
}

export function renderField(field) {
  const props = { key: field.id, field }
  if (field.type === 'select') return <SelectField {...props} />
  if (field.type === 'numberUnit') return <NumberUnitField {...props} />
  return <NumberField {...props} />
}
