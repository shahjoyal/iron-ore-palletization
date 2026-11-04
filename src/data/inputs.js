/**
 * Single source of truth for the inputs on the main page.
 * One flat list, taken from Pellete_Parameters.docx. TG CCS is the only
 * extra field and is shown only when the plant runs a grate kiln.
 */

const num = (key, id, label, min, max, step, unit = '') => ({
  type: 'number', group: 'inputs', key, id, label, min, max, step, unit,
})

export const INPUT_FIELDS = [
  num('fe', 'm-fe', 'Fe', 55, 70, 0.1, '%'),
  num('sio2', 'm-sio2', 'SiO₂', 0, 10, 0.1, '%'),
  num('al2o3', 'm-al2o3', 'Al₂O₃', 0, 8, 0.1, '%'),
  num('coal', 'm-coal', 'Coal', 0, 5, 0.1, '%'),
  num('blaine', 'm-blaine', 'Blaine number', 1800, 3200, 10, 'cm²/g'),
  num('filterCakeMoisture', 'm-fcm', 'Filter cake moisture', 8, 13, 0.1, '%'),
  num('bentoniteDosage', 'm-bento', 'Bentonite dosage', 0, 1.5, 0.01, '%'),
  num('flux', 'm-flux', 'Flux (limestone / dolomite)', 0, 10, 0.1, '%'),
  num('mixMoisture', 'm-mixmoist', 'Mix material moisture', 0, 20, 0.1, '%'),
  num('greenBallMoisture', 'm-gbmoist', 'Green ball moisture', 8, 12, 0.1, '%'),
  num('gcs', 'm-gcs', 'GCS (green compressive strength)', 1, 1.5, 0.05, 'kg/pellet'),
  num('dropNumber', 'm-drop', 'Drop number', 20, 45, 1, 'drops'),
]

/** Grate kiln only. */
export const TG_CCS_FIELD = num('tgCcs', 'm-tgccs', 'TG CCS', 100, 400, 1, 'kg/pellet')

export const inputFields = (params) =>
  (params.indu.mode === 'grate' ? [...INPUT_FIELDS, TG_CCS_FIELD] : INPUT_FIELDS)

/** Machine shown beside the inputs, which follows the plant's technology. */
export function machineView(mode) {
  const grate = mode === 'grate'
  return {
    title: grate ? 'Grate kiln' : 'Induration furnace',
    drawing: grate ? 'Grate kiln – travelling grate' : 'Induration furnace – straight grate',
    video: grate ? 'grate_kiln' : 'induration_furnace',
  }
}

export const initialParams = () => ({
  inputs: Object.fromEntries([...INPUT_FIELDS, TG_CCS_FIELD].map((f) => [f.key, ''])),
  indu: { mode: 'furnace' }, // set from the selected plant
})
