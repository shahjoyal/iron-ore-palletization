import { motion } from 'framer-motion'
import { useId } from 'react'

/** Segmented toggle with a sliding highlight. */
export function Segmented({ value, onChange, options }) {
  const uid = useId()
  return (
    <div className="segmented" role="radiogroup">
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" aria-checked={value === o.value}
          className={value === o.value ? 'is-on' : ''} onClick={() => onChange(o.value)}>
          {value === o.value && (
            <motion.span layoutId={`seg-${uid}`} className="segmented-pill" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />
          )}
          <span className="segmented-label">{o.label}</span>
        </button>
      ))}
    </div>
  )
}
