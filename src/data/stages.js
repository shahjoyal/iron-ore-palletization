/**
 * Single source of truth for the process route.
 * Each stage lists its media, the parameter groups it edits and (for simple
 * stages) a declarative form schema. Stages with richer inputs set `form`
 * to the name of a dedicated component instead.
 */

const num = (group, key, id, label, min, max, step, unit = '') => ({
  type: 'number', group, key, id, label, min, max, step, unit,
})
const select = (group, key, id, label, options, hint) => ({
  type: 'select', group, key, id, label, options, hint,
})

const vacuum = (group, id) => num(group, 'vacuumPressure', id, 'Vacuum pressure', -800, -200, 10, 'mbar')

const SIZE_OPTIONS = [
  { value: '8-10', label: '8 – 10 mm' },
  { value: '10-12', label: '10 – 12 mm' },
  { value: '12-14', label: '12 – 14 mm' },
  { value: '14-16', label: '14 – 16 mm' },
]

export const STAGES = [
  {
    id: 'feed', title: 'Iron ore feed', blurb: 'Ore grade, source and additives',
    drawing: 'Iron ore feed hopper', video: 'feed', form: 'feed', groups: ['feed'],
    isDone: (p) => !!p.feed.ore,
  },
  {
    id: 'grind', title: 'Grinding', blurb: 'Mill speed, fineness, retention',
    drawing: 'Ball mill – grinding and mixing', video: 'grinding', groups: ['grind'],
    isDone: (p) => !!p.grind.blain,
    sections: () => [
      { fields: [
        num('grind', 'rawFeedMoisture', 'm-rfmoist', 'Raw feed moisture', 8, 15, 0.1, '%'),
        num('grind', 'blain', 'm-blain', 'Blaine number', 1800, 3200, 10, 'cm²/g'),
      ] },
      { title: 'Mill operation', fields: [
        num('grind', 'millSpeed', 'm-millspeed', 'Mill speed', 12, 22, 0.1, 'RPM'),
        num('grind', 'retentionTime', 'm-rettime', 'Retention time', 20, 60, 1, 'min'),
      ] },
    ],
  },
  {
    id: 'thickner', title: 'Thickener', blurb: 'Underflow density, vacuum',
    drawing: 'Thickener – settling and rake', video: 'thickner', groups: ['thickner'],
    isDone: (p) => !!p.thickner.underflowDensity,
    sections: () => [
      { fields: [num('thickner', 'underflowDensity', 'm-ufd', 'Underflow density', 2.01, 2.1, 0.01, 't/m³')] },
      { title: 'Vacuum system', fields: [vacuum('thickner', 'm-vacpres')] },
    ],
  },
  {
    id: 'filter', title: 'Filter cake', blurb: 'Cake moisture, vacuum',
    drawing: 'Disk filter – vacuum filtration', video: 'filter', groups: ['filter'],
    isDone: (p) => !!p.filter.cakeMoisture,
    sections: () => [{ fields: [
      num('filter', 'cakeMoisture', 'm-fcm', 'Filter cake moisture', 8, 13, 0.1, '%'),
      vacuum('filter', 'm-fvp'),
    ] }],
  },
  {
    id: 'mix', title: 'Mixing + binder', blurb: 'Binder, bentonite, mix moisture',
    drawing: 'Horizontal paddle mixer', video: 'mixing', form: 'mix', groups: ['mix'],
    isDone: (p) => !!p.mix.binder,
  },
  {
    id: 'ball', title: 'Balling disc', blurb: 'Disc angle, speed, water spray',
    drawing: 'Balling disc – top view', video: 'balling', groups: ['ball'],
    isDone: (p) => !!p.ball.angle,
    sections: () => [
      { fields: [
        num('ball', 'angle', 'm-angle', 'Disc inclination angle', 46, 50, 0.5, '°'),
        num('ball', 'motorRpm', 'm-motorrpm', 'Motor speed', 900, 1400, 1, 'RPM'),
        num('ball', 'discRpm', 'm-discrpm', 'Disc speed', 6, 8, 0.1, 'RPM'),
      ] },
      { title: 'Water and moisture', fields: [
        num('ball', 'waterSprayRate', 'm-wsr', 'Water spray rate', 0, 200, 1, 'L/min'),
        num('ball', 'greenBallMoisture', 'm-gbmoist', 'Green ball moisture', 0, 20, 0.1, '%'),
      ] },
    ],
  },
  {
    id: 'greenball', title: 'Green ball + screening', blurb: 'Green ball quality, size split',
    drawing: 'Screening conveyor', video: 'greenball', groups: ['greenball', 'screen'],
    isDone: (p) => !!p.greenball.moisture || !!p.screen.s8_10,
    sections: () => [
      { title: 'Green ball properties', fields: [
        num('greenball', 'moisture', 'm-gbp-moist', 'Green ball moisture', 9.5, 11, 0.1, '%'),
        num('greenball', 'dropNumber', 'm-gbp-drop', 'Drop number', 20, 45, 1, 'drops'),
        num('greenball', 'gcs', 'm-gbp-gcs', 'GCS per green pellet', 1, 1.5, 0.05, 'kg'),
        select('greenball', 'greenBallSize', 'm-gbp-size', 'Green ball size', SIZE_OPTIONS, 'Target size fraction, 8 – 16 mm'),
        num('greenball', 'porosity', 'm-gbp-por', 'Porosity', 20, 35, 0.1, '%'),
      ] },
      { title: 'Screening', note: 'Enter the share of each size fraction. The remainder is oversize plus undersize.', grid: true, fields: [
        num('screen', 's8_10', 'm-s8', '8 – 10 mm', 0, 100, 0.1, '%'),
        num('screen', 's10_12', 'm-s10', '10 – 12 mm', 0, 100, 0.1, '%'),
        num('screen', 's12_14', 'm-s12', '12 – 14 mm', 0, 100, 0.1, '%'),
        num('screen', 's14_16', 'm-s14', '14 – 16 mm', 0, 100, 0.1, '%'),
      ] },
      { fields: [{
        type: 'numberUnit', group: 'screen', key: 'recycled', unitKey: 'recycledUnit',
        id: 'm-recycled', unitId: 'm-recycled-unit', label: 'Recycled material',
        units: ['%', 'tph'], min: 0, hint: 'Oversize (> 16 mm) and undersize (< 8 mm)',
      }] },
    ],
  },
  {
    id: 'indu', title: 'Induration', blurb: 'Machine type and firing settings',
    drawing: 'Induration machine', video: 'induration_furnace', form: 'indu', groups: ['indu'],
    isDone: (p) => (p.indu.mode === 'grate' ? !!p.indu.tgRpm : !!p.indu.rpm),
  },
  {
    id: 'cool', title: 'Cooling', blurb: 'Temperature in each cooling zone',
    drawing: 'Cooling kiln', video: 'cooling', form: 'cool', groups: ['cool'],
    isDone: (p) => !!p.cool.zone1,
  },
]

export const STAGE_BY_ID = Object.fromEntries(STAGES.map((s) => [s.id, s]))

/** Induration swaps its name, drawing and footage with the machine type. */
export function stageView(stage, params) {
  if (stage.id !== 'indu') return stage
  const grate = params.indu.mode === 'grate'
  return {
    ...stage,
    title: grate ? 'Grate kiln' : 'Induration furnace',
    drawing: grate ? 'Grate kiln – travelling grate' : 'Induration furnace – straight grate',
    video: grate ? 'grate_kiln' : 'induration_furnace',
  }
}

export const initialParams = () => ({
  feed: { ore: '', orePercent: '', feedRate: '', fluxes: [], fuels: [], zone: '', location: '', loi: '',
    chemMoisture: '', chemFe: '', chemSio2: '', chemAl2o3: '', chemBlain: '', chemMic45: '',
    chemBentonite: '', chemOb1205: '', chemCcs: '', chemTi: '', chemAi: '' },
  grind: { rawFeedMoisture: '', blain: '', millSpeed: '', retentionTime: '' },
  thickner: { underflowDensity: '', vacuumPressure: '' },
  filter: { cakeMoisture: '', vacuumPressure: '' },
  mix: { binder: '', bentonite: '', bentoniteType: '', bentoniteDosageValue: '', bentoniteDosageUnit: 'kg',
    dosageValue: '', dosageUnit: 'GPT', fluxes: [], mixMoisture: '', waterAddition: '' },
  ball: { angle: '', motorRpm: '', discRpm: '', greenBallMoisture: '', waterSprayRate: '' },
  greenball: { moisture: '', dropNumber: '', gcs: '', greenBallSize: '', porosity: '' },
  screen: { s8_10: '', s10_12: '', s12_14: '', s14_16: '', recycled: '', recycledUnit: '%' },
  indu: { mode: 'furnace', rpm: '', btt: '', drm: '', exhaust: '', tgRpm: '', mcTemp: '', tgDischarge: '', tgExhaust: '' },
  cool: { zone1: '', zone2: '', zone3: '', zone4: '', zoneCount: 1 },
})
