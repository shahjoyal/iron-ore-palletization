import { AnimatePresence, motion } from 'framer-motion'
import { useSimStore } from '../../store/useSimStore'
import { ORE_ZONES } from '../../data/oreZones'
import { Section } from '../fields/Section'
import { Field, NumberField, SelectControl } from '../fields/Field'
import { Segmented } from '../fields/Segmented'
import { FluxList, FuelList } from '../fields/RowList'

const ORES = ['Hematite', 'Magnetite', 'Limonite', 'Goethite']
const ZONES = [{ value: 'E', label: 'East' }, { value: 'S', label: 'South' }, { value: 'C', label: 'Central' }]

const num = (key, id, label, min, max, step, unit) => ({ type: 'number', group: 'feed', key, id, label, min, max, step, unit })

// [param key, label, ORE_ZONES key, decimals, unit, accent]
const CHEM_GROUPS = [
  { title: 'Filter cake chemistry', cols: 4, cells: [
    ['chemMoisture', 'Moisture', 'moisture', 2, '%'], ['chemFe', 'Fe', 'fe', 2, '%', 'fe'],
    ['chemSio2', 'SiO₂', 'sio2', 2, '%'], ['chemAl2o3', 'Al₂O₃', 'al2o3', 2, '%'] ] },
  { title: 'Grinding', cols: 2, cells: [
    ['chemBlain', 'Blaine no.', 'blain', 0, 'cm²/g'], ['chemMic45', '−45 µm', 'mic45', 2, '%'] ] },
  { title: 'Binder and additive use', cols: 2, cells: [
    ['chemBentonite', 'Bentonite', 'bentonite', 2, 'kg/T'], ['chemOb1205', 'OB-1205', 'ob1205', 2, 'GPT'] ] },
  { title: 'Pellet quality', cols: 3, cells: [
    ['chemCcs', 'CCS', 'ccs', 0, 'kg/p'], ['chemTi', 'TI', 'ti', 2, '%'], ['chemAi', 'AI', 'ai', 2, '%'] ] },
]

const mid = (r) => ((r.min + r.max) / 2)

function ChemCard({ data }) {
  const feed = useSimStore((s) => s.params.feed)
  const setParam = useSimStore((s) => s.setParam)
  const zone = ORE_ZONES[feed.zone]
  return (
    <motion.div className="chem-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="chem-title">{zone.label}, {feed.location}</div>
      {CHEM_GROUPS.map((g) => (
        <div key={g.title}>
          <div className="chem-group">{g.title}</div>
          <div className="chem-grid" style={{ '--cols': g.cols }}>
            {g.cells.map(([key, label, src, dec, unit, accent]) => {
              const r = data[src]
              return (
                <label key={key} className={`chem-cell${accent ? ` accent-${accent}` : ''}`}>
                  <span className="chem-label">{label}</span>
                  <input className="chem-input mono" type="number" step={Math.pow(10, -dec).toFixed(dec)}
                    value={feed[key]} onChange={(e) => setParam('feed', key, e.target.value)} />
                  <span className="chem-unit">{unit}</span>
                  <span className="chem-range mono">{r.min.toFixed(dec)} – {r.max.toFixed(dec)}</span>
                </label>
              )
            })}
          </div>
        </div>
      ))}
      <div className="field-hint">Pre-filled with the midpoint of the typical range. Edit any value.</div>
    </motion.div>
  )
}

export function FeedForm() {
  const feed = useSimStore((s) => s.params.feed)
  const patchGroup = useSimStore((s) => s.patchGroup)
  const hematite = feed.ore === 'Hematite'
  const locations = feed.zone ? Object.keys(ORE_ZONES[feed.zone].locations) : []
  const data = feed.zone && feed.location ? ORE_ZONES[feed.zone].locations[feed.location] : null

  const blankChem = Object.fromEntries(CHEM_GROUPS.flatMap((g) => g.cells.map((c) => [c[0], ''])))
  const pickLocation = (location) => {
    const d = location ? ORE_ZONES[feed.zone].locations[location] : null
    const chem = d
      ? Object.fromEntries(CHEM_GROUPS.flatMap((g) => g.cells.map(([key, , src, dec]) => [key, mid(d[src]).toFixed(dec)])))
      : blankChem
    patchGroup('feed', { location, ...chem })
  }

  return (
    <>
      <Section>
        <Field label="Iron ore grade" htmlFor="m-ore">
          <SelectControl id="m-ore" value={feed.ore} options={ORES} placeholder="Select grade"
            onChange={(ore) => patchGroup('feed', { ore })} />
        </Field>
        <AnimatePresence initial={false}>
          {hematite && (
            <motion.div key="origin" className="field-stack" style={{ overflow: 'hidden' }}
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
              <Field label="Ore source zone">
                <Segmented value={feed.zone} options={ZONES}
                  onChange={(zone) => patchGroup('feed', { zone, location: '', ...blankChem })} />
              </Field>
              <Field label="Mine location" htmlFor="m-feed-location"
                hint={feed.zone ? undefined : 'Choose a zone first, then pick the mine location'}>
                <SelectControl id="m-feed-location" value={feed.location} options={locations}
                  placeholder="Select location" onChange={pickLocation} />
              </Field>
              <AnimatePresence mode="wait">
                {data && <ChemCard key={`${feed.zone}-${feed.location}`} data={data} />}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </Section>

      <Section title="Feed composition">
        <NumberField field={num('orePercent', 'm-ore-pct', 'Iron ore percentage', 55, 65, 0.1, '%')} />
        <NumberField field={num('loi', 'm-loi', 'LOI (loss on ignition)', 1, 12, 0.1, '%')} />
        <NumberField field={{ ...num('feedRate', 'm-feedrate', 'Feed rate', 1, 9999, 0.1, 'TPH'), hint: 'Tonnes per hour' }} />
      </Section>

      <Section title="Additives and fuel">
        <FluxList group="feed" />
        <FuelList />
      </Section>
    </>
  )
}
