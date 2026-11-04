import { useSimStore } from '../../store/useSimStore'
import { Section } from '../fields/Section'
import { NumberField } from '../fields/Field'
import { FluxList } from '../fields/RowList'

/*
 * PAUSED (kept for later): ore grade, source zone / mine location with the chemistry card, feed composition and the
 * fuel list. They are in git history of this file and summarised here:
 *   - Iron ore grade (Hematite / Magnetite / Limonite / Goethite), zone (E / S / C) and mine location, which filled
 *     the chemistry sliders from data/oreZones.js
 *   - Iron ore percentage, LOI, Feed rate
 *   - <FuelList /> (anthracite coal, fuel oil, gas with quantity and GCV)
 * ChemCard, CHEM_GROUPS and the ORE_ZONES wiring can be restored from the original zip if they are needed again.
 */

const num = (key, id, label, min, max, step, unit) => ({ type: 'number', group: 'feed', key, id, label, min, max, step, unit })

export function FeedForm() {
  return (
    <>
      <Section title="Ore chemistry">
        <NumberField field={num('chemFe', 'm-chem-fe', 'Fe', 55, 68, 0.1, '%')} />
        <NumberField field={num('chemSio2', 'm-chem-sio2', 'SiO₂', 2, 8, 0.1, '%')} />
        <NumberField field={num('chemAl2o3', 'm-chem-al2o3', 'Al₂O₃', 0.5, 6, 0.1, '%')} />
      </Section>

      <Section title="Coal and flux">
        <NumberField field={num('coalPct', 'm-coal-pct', 'Coal', 0, 5, 0.1, '%')} />
        <FluxList group="feed" />
      </Section>
    </>
  )
}
