import { useSimStore } from '../../store/useSimStore'
import { Section } from '../fields/Section'
import { Field, InlineSlider, NumberField, SelectControl, UnitSelect } from '../fields/Field'
import { FluxList } from '../fields/RowList'

const BINDERS = ['OB-1205 Organic', 'OB-1206', 'OB3s', 'OB Pro', 'OB-1205 + Bentonite']
const BENTONITE_TYPES = [{ value: 'Sodium', label: 'Sodium bentonite' }, { value: 'Calcium', label: 'Calcium bentonite' }]

export function MixForm() {
  const mix = useSimStore((s) => s.params.mix)
  const setParam = useSimStore((s) => s.setParam)
  const set = (key) => (v) => setParam('mix', key, v)
  return (
    <>
      <Section title="Bentonite">
        <Field label="Bentonite type" htmlFor="m-bentonite-type" hint="Sodium swells more; calcium swells less">
          <SelectControl id="m-bentonite-type" value={mix.bentoniteType} options={BENTONITE_TYPES}
            placeholder="Select type" onChange={set('bentoniteType')} />
        </Field>
        <Field label="Grade" htmlFor="m-bentonite">
          <SelectControl id="m-bentonite" value={mix.bentonite} options={['Bentonite (6 kg/t)']}
            placeholder="Select grade" onChange={set('bentonite')} />
        </Field>
        <InlineSlider id="m-bento-dose" label="Dosage"
          min={0} max={mix.bentoniteDosageUnit === '%' ? 1.5 : 15} step={mix.bentoniteDosageUnit === '%' ? 0.01 : 0.1}
          value={mix.bentoniteDosageValue} onChange={set('bentoniteDosageValue')}
          unitSlot={<UnitSelect id="m-bento-dose-unit" value={mix.bentoniteDosageUnit} onChange={set('bentoniteDosageUnit')}
            units={[{ value: 'kg', label: 'kg/T' }, { value: '%', label: '%' }]} />} />
      </Section>

      <Section title="OB binder">
        <Field label="Binder" htmlFor="m-ob-binder">
          <SelectControl id="m-ob-binder" value={mix.binder} options={BINDERS}
            placeholder="Select binder" onChange={set('binder')} />
        </Field>
        <InlineSlider id="m-dose" label={mix.binder ? `${mix.binder} dosage` : 'Binder dosage'} min={0} max={60} step={0.5} unit="GPT"
          hint="Typical: 20 – 38 GPT" value={mix.dosageValue} onChange={set('dosageValue')} />
      </Section>

      <Section title="Flux and moisture">
        <NumberField field={{ type: 'number', group: 'mix', key: 'waterAddition', id: 'm-wateradd', label: 'Water addition', min: 0, max: 500, step: 1, unit: 'L/min' }} />
        <FluxList group="mix" />
        <NumberField field={{ type: 'number', group: 'mix', key: 'mixMoisture', id: 'm-mmoist', label: 'Mix material moisture', min: 0, max: 20, step: 0.1, unit: '%' }} />
      </Section>
    </>
  )
}
