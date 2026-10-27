import { AnimatePresence, motion } from 'framer-motion'
import { useSimStore } from '../../store/useSimStore'
import { Section } from '../fields/Section'
import { NumberField } from '../fields/Field'

const ZONES = [
  { name: 'Combustion', typical: 900 },
  { name: 'UDD upper draft', typical: 680 },
  { name: 'DD1 down draft', typical: 380 },
  { name: 'Exit', typical: 170 },
]

export function CoolForm() {
  const cool = useSimStore((s) => s.params.cool)
  const grate = useSimStore((s) => s.params.indu.mode === 'grate')
  const patchGroup = useSimStore((s) => s.patchGroup)
  const count = Math.min(4, Math.max(cool.zoneCount || 1, cool.zone4 ? 4 : 0, cool.zone3 ? 3 : 0, cool.zone2 ? 2 : 0, cool.zone1 ? 1 : 0))
  return (
    <Section title={grate ? 'Circulating cooling zone' : 'Straight cooling zone'}
      note={`${count} of 4 zones active. Typical temperatures are shown in each field.`}>
      <AnimatePresence initial={false}>
        {ZONES.slice(0, count).map((z, i) => (
          <motion.div key={z.name} style={{ overflow: 'hidden' }} initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}>
            <NumberField field={{
              type: 'number', group: 'cool', key: `zone${i + 1}`, id: `cool-z${i + 1}`,
              label: `Zone ${i + 1}: ${z.name}`, min: 50, max: 1000, step: 1, unit: '°C', hint: `Typical: ${z.typical} °C`,
            }} />
          </motion.div>
        ))}
      </AnimatePresence>
      {count < 4 && (
        <button type="button" className="btn-add" onClick={() => patchGroup('cool', { zoneCount: count + 1 })}>
          <span aria-hidden="true">+</span> Add cooling zone
        </button>
      )}
    </Section>
  )
}
