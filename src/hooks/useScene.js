import { useEffect, useRef } from 'react'
import { useSimStore } from '../store/useSimStore'
import { onTouch } from '../lib/bus'

/** The drawing routines read saved values through this live view of the store. */
const liveParams = new Proxy({}, { get: (_, key) => useSimStore.getState().params[key] })

/**
 * Mounts a canvas scene, drives it with requestAnimationFrame and forwards
 * input edits / saves to it. Returns the canvas ref and the scene instance ref.
 */
export function useScene(factory) {
  const canvasRef = useRef(null)
  const sceneRef = useRef(null)

  useEffect(() => {
    if (!factory || !canvasRef.current) return undefined
    const scene = factory(canvasRef.current, liveParams)
    sceneRef.current = scene
    const slow = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    let n = 0
    let reported = false
    const loop = () => {
      raf = requestAnimationFrame(loop)
      try {
        if (!slow || n++ % 8 === 0) scene.tick()
      } catch (err) {
        if (!reported) { reported = true; console.warn('Drawing frame skipped:', err.message) }
      }
    }
    loop()
    const off = onTouch(() => scene.touch?.())
    return () => {
      cancelAnimationFrame(raf)
      off()
      sceneRef.current = null
    }
  }, [factory])

  return { canvasRef, sceneRef }
}
