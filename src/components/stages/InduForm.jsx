import { AnimatePresence, motion } from 'framer-motion'
import { useSimStore } from '../../store/useSimStore'
import { Section } from '../fields/Section'
import { Field, NumberField } from '../fields/Field'
import { Segmented } from '../fields/Segmented'

const n = (key, id, label, min, max, step, unit, hint) => ({ type: 'number', group: 'indu', key, id, label, min, max, step, unit, hint })

const FURNACE = [
  n('rpm', 'm-irpm', 'Machine speed', 2, 6, 0.1, 'RPM'),
  n('btt', 'm-btt', 'Burn-through temperature', 320, 400, 1, '°C'),
  n('drm', 'm-drm', 'DRM temperature', 850, 950, 1, '°C'),
  n('exhaust', 'm-exhaust', 'Exhaust hood pressure', -100, 150, 1, 'bar'),
]
const KILN = [
  n('tgRpm', 'm-tgrpm', 'TG speed', 2, 6, 0.1, 'RPM'),
  n('mcTemp', 'm-mctemp', 'Multi-cyclone temperature', 280, 350, 1, '°C'),
  n('tgDischarge', 'm-tgdis', 'TG discharge temperature', 0, 1200, 1, '°C'),
  n('tgExhaust', 'm-tgexh', 'Exhaust hood pressure', -45, -20, 1, 'bar'),
]

export function InduForm() {
  const mode = useSimStore((s) => s.params.indu.mode)
  const patchGroup = useSimStore((s) => s.patchGroup)
  return (
    <>
      <Section>
        <Field label="Machine type">
          <Segmented value={mode} onChange={(m) => patchGroup('indu', { mode: m })}
            options={[{ value: 'furnace', label: 'Induration furnace' }, { value: 'grate', label: 'Grate kiln' }]} />
        </Field>
      </Section>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={mode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}>
          <Section title={mode === 'furnace' ? 'Straight grate settings' : 'Travelling grate settings'}>
            {(mode === 'furnace' ? FURNACE : KILN).map((f) => <NumberField key={f.id} field={f} />)}
          </Section>
        </motion.div>
      </AnimatePresence>
    </>
  )
}
