/* Tiny event bus: input cards announce edits, drawings react to them. */
const target = new EventTarget()
// Deferred one tick so drawings read the value React has just committed.
export const emitTouch = () => setTimeout(() => target.dispatchEvent(new Event('touch')), 0)
export const onTouch = (fn) => {
  target.addEventListener('touch', fn)
  return () => target.removeEventListener('touch', fn)
}
