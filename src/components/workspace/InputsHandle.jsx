import { motion } from 'framer-motion'

/** Three-dot tab on the edge of the output. Hover or click to bring the inputs back. */
export function InputsHandle({ open, onEnter, onClick }) {
  return (
    <motion.button type="button" className={`handle${open ? ' is-open' : ''}`} onPointerEnter={onEnter} onClick={onClick}
      aria-expanded={open} aria-label={open ? 'Hide inputs' : 'Show inputs'}
      initial={{ opacity: 0, scale: 0.4, x: 12 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0, scale: 0.4 }}
      transition={{ type: 'spring', stiffness: 380, damping: 22, delay: 0.7 }}
      whileTap={{ scale: 0.92 }}>
      <span className="handle-dots" aria-hidden="true"><i /><i /><i /></span>
      <span className="handle-label">{open ? 'Hide inputs' : 'Inputs'}</span>
    </motion.button>
  )
}
