import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSimStore } from '../../store/useSimStore'

/** Appears after Reset; Undo restores everything for a few seconds. */
export function ResetToast() {
  const undo = useSimStore((s) => s.undo)
  const undoReset = useSimStore((s) => s.undoReset)
  const clearUndo = useSimStore((s) => s.clearUndo)
  useEffect(() => {
    if (!undo) return undefined
    const t = setTimeout(clearUndo, 7000)
    return () => clearTimeout(t)
  }, [undo, clearUndo])
  return (
    <AnimatePresence>
      {undo && (
        <motion.div className="toast" role="status" initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16 }} transition={{ type: 'spring', stiffness: 380, damping: 28 }}>
          <span>Everything was reset</span>
          <button type="button" onClick={undoReset}>Undo</button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
