import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STAGES, STAGE_BY_ID, initialParams } from '../data/stages'
import { PLANT_TECH } from '../data/plants'
import { makeResults } from '../data/results'

const ids = STAGES.map((s) => s.id)
export const STEP_MS = 480
let runToken = 0 // lets Reset cancel a run that is still in flight

/** Summary figures, computed with the same rules as the original simulator. */
function summarise(p) {
  const hasOb = !!p.mix.binder && p.mix.binder.includes('OB')
  const hasFlux = p.mix.fluxes.some((f) => f.type)
  const moist = Number(p.filter.cakeMoisture)
  const grate = p.indu.mode === 'grate'
  const temp = grate ? (p.indu.mcTemp ? `${p.indu.mcTemp}°C MC` : '—') : (p.indu.btt ? `${p.indu.btt}°C BTT` : '—')
  const pick = (base) => base + Math.floor(Math.random() * 8)
  return {
    size: moist > 10.5 ? '14–18 mm' : '10–16 mm',
    binder: hasOb ? (p.mix.dosageValue ? `${p.mix.dosageValue} ${p.mix.dosageUnit}` : p.mix.binder) : (p.mix.binder || '—'),
    binderOk: hasOb,
    yield: p.feed.ore ? `${hasOb ? pick(82) : pick(70)}%` : '—',
    basicity: hasFlux ? (0.9 + Math.random() * 0.5).toFixed(2) : '0.35',
    temp,
    moisture: p.filter.cakeMoisture ? `${p.filter.cakeMoisture}%` : '—',
  }
}

export const useSimStore = create(
  persist(
    (set, get) => ({
      plant: '',
      capacity: '',
      params: initialParams(),
      saved: {},          // stage id -> true once the person saves the card
      active: ids[0],
      saveTick: 0,        // bumps on every save so the drawing can celebrate

      phase: 'inputs',    // 'inputs' -> 'running' -> 'results'
      runStep: -1,
      panelMax: false,    // results phase: input panel maximised
      stale: false,       // inputs edited after the last run
      undo: null,         // snapshot taken by Reset so it can be undone
      summary: null,
      results: null,

      setPlant: (plant) => set((s) => {
        const mode = plant ? (PLANT_TECH[plant] === 'straight_grate' ? 'furnace' : 'grate') : 'furnace'
        return { plant, stale: s.phase === 'results' || s.stale, params: { ...s.params, indu: { ...s.params.indu, mode } } }
      }),
      setCapacity: (capacity) => set((s) => ({ capacity, stale: s.phase === 'results' || s.stale })),
      setParam: (group, key, value) => set((s) => ({
        stale: s.phase === 'results' || s.stale,
        params: { ...s.params, [group]: { ...s.params[group], [key]: value } },
      })),
      patchGroup: (group, patch) => set((s) => ({
        stale: s.phase === 'results' || s.stale,
        params: { ...s.params, [group]: { ...s.params[group], ...patch } },
      })),

      // Picking a stage after the run reopens the inputs over the output.
      goTo: (id) => set((s) => (s.phase === 'running' ? {} : { active: id })),
      saveStage: (id) => set((s) => ({ saved: { ...s.saved, [id]: true }, saveTick: s.saveTick + 1 })),
      step: (dir) => set((s) => {
        const i = ids.indexOf(s.active) + dir
        return i >= 0 && i < ids.length ? { active: ids[i] } : {}
      }),
      togglePanel: () => set((s) => ({ panelMax: !s.panelMax })),

      runSimulation: () => {
        if (get().phase === 'running') return
        const token = ++runToken
        set({ phase: 'running', runStep: 0, panelMax: false, stale: false })
        ids.forEach((_, i) => setTimeout(() => runToken === token && set({ runStep: i }), i * STEP_MS))
        setTimeout(() => {
          if (runToken !== token) return
          const p = get().params
          set({ phase: 'results', runStep: -1, summary: summarise(p), results: makeResults(p) })
        }, ids.length * STEP_MS + 500)
      },

      // One click clears everything; the snapshot lets the toast offer Undo.
      reset: () => {
        runToken++
        const s = get()
        const undo = {
          plant: s.plant, capacity: s.capacity, params: s.params, saved: s.saved, active: s.active,
          phase: s.phase === 'running' ? 'inputs' : s.phase, summary: s.summary, results: s.results, stale: s.stale,
        }
        set({
          plant: '', capacity: '', params: initialParams(), saved: {}, active: ids[0],
          phase: 'inputs', runStep: -1, panelMax: false, stale: false, summary: null, results: null, undo,
        })
      },
      undoReset: () => set((s) => (s.undo ? { ...s.undo, undo: null, runStep: -1, panelMax: false } : {})),
      clearUndo: () => set({ undo: null }),
    }),
    {
      name: 'abhitech_sim_v2',
      version: 2,
      migrate: (s) => ({ ...s, active: STAGE_BY_ID[s.active] ? s.active : ids[0] }),
      partialize: (s) => ({
        plant: s.plant, capacity: s.capacity, params: s.params, saved: s.saved, active: s.active,
        phase: s.phase === 'results' && s.results ? 'results' : 'inputs', summary: s.summary, results: s.results,
      }),
    },
  ),
)

/** saved: card saved · draft: has data but not saved yet · empty */
export const stageStatus = (id, saved, params) =>
  saved[id] ? 'saved' : STAGE_BY_ID[id].isDone(params) ? 'draft' : 'empty'
