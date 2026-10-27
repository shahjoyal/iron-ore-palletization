export const ease = [0.22, 1, 0.36, 1]
export const enter = (d = 0.65) => ({ duration: d, ease })
/** Exits ease in (slow start) and fade late, so each block visibly glides away before it disappears. */
export const leave = (delay = 0) => ({
  duration: 0.6, delay, ease: [0.55, 0, 0.85, 0.4], opacity: { duration: 0.5, delay: delay + 0.14, ease: 'linear' },
})
