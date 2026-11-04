import { useSimStore } from '../../store/useSimStore'
import { Section } from '../fields/Section'
import { InlineSlider, NumberField, UnitSelect } from '../fields/Field'
import { FluxList } from '../fields/RowList'

/*
 * PAUSED (kept for later): bentonite type and grade selects, the OB binder select with its GPT dosage, and water addition.
 *
 * const BINDERS = ['OB-1205 Organic', 'OB-1206', 'OB3s', 'OB Pro', 'OB-1205 + Bentonite']
 * const BENTONITE_TYPES = [{ value: 'Sodium', label: 'Sodium bentonite' }, { value: 'Calcium', label: 'Calcium bentonite' }]
 *
 * <Field label="Bentonite type"> <SelectControl id="m-bentonite-type" ... /> </Field>
 * <Field label="Grade">          <SelectControl id="m-bentonite" options={['Bentonite (6 kg/t)']} ... /> </Field>
 * <Field label="Binder">         <SelectControl id="m-ob-binder" options={BINDERS} ... /> </Field>
 * <InlineSlider id="m-dose" label="Binder dosage" min={0} max={60} step={0.5} unit="GPT" hint="Typical: 20 – 38 GPT" ... />
 * <NumberField field={{ group: 'mix', key: 'waterAddition', id: 'm-wateradd', label: 'Water addition', min: 0, max: 500, step: 1, unit: 'L/min' }} />
 */

export function MixForm() {
  const mix = useSimStore((s) => s.params.mix)
  const setParam = useSimStore((s) => s.setParam)
  const set = (key) => (v) => setParam('mix', key, v)
  return (
    <>
      <Section title="Bentonite">
        <InlineSlider id="m-bento-dose" label="Bentonite dosage"
          min={0} max={mix.bentoniteDosageUnit === '%' ? 1.5 : 15} step={mix.bentoniteDosageUnit === '%' ? 0.01 : 0.1}
          value={mix.bentoniteDosageValue} onChange={set('bentoniteDosageValue')}
          unitSlot={<UnitSelect id="m-bento-dose-unit" value={mix.bentoniteDosageUnit} onChange={set('bentoniteDosageUnit')}
            units={[{ value: '%', label: '%' }, { value: 'kg', label: 'kg/T' }]} />} />
      </Section>

      <Section title="Flux and moisture">
        <FluxList group="mix" />
        <NumberField field={{ type: 'number', group: 'mix', key: 'mixMoisture', id: 'm-mmoist', label: 'Mix material moisture', min: 0, max: 20, step: 0.1, unit: '%' }} />
      </Section>
    </>
  )
}
