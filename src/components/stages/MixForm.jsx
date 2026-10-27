import { useSimStore } from '../../store/useSimStore'
import { Section } from '../fields/Section'
import { Field, NumberField, SelectControl } from '../fields/Field'
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
        <Field label="Dosage" htmlFor="m-bento-dose">
          <div className="input-row">
            <input id="m-bento-dose" className="input mono" type="number" min={0} step={0.01} placeholder="0.00"
              value={mix.bentoniteDosageValue} onChange={(e) => set('bentoniteDosageValue')(e.target.value)} />
            <div className="select-wrap select-narrow">
              <select id="m-bento-dose-unit" className="input select" value={mix.bentoniteDosageUnit}
                onChange={(e) => set('bentoniteDosageUnit')(e.target.value)}>
                <option value="kg">kg/T</option>
                <option value="%">%</option>
              </select>
            </div>
          </div>
        </Field>
      </Section>

      <Section title="OB binder">
        <Field label="Binder" htmlFor="m-ob-binder">
          <SelectControl id="m-ob-binder" value={mix.binder} options={BINDERS}
            placeholder="Select binder" onChange={set('binder')} />
        </Field>
        <Field label={mix.binder ? `${mix.binder} dosage` : 'Binder dosage'} htmlFor="m-dose">
          <div className="input-wrap">
            <input id="m-dose" className="input mono" type="number" min={0} step={0.01} placeholder="0.00"
              value={mix.dosageValue} onChange={(e) => set('dosageValue')(e.target.value)} />
            <span className="input-unit">GPT</span>
          </div>
        </Field>
      </Section>

      <Section title="Flux and moisture">
        <NumberField field={{ type: 'number', group: 'mix', key: 'waterAddition', id: 'm-wateradd', label: 'Water addition', min: 0, max: 500, step: 1, unit: 'L/min' }} />
        <FluxList group="mix" />
        <NumberField field={{ type: 'number', group: 'mix', key: 'mixMoisture', id: 'm-mmoist', label: 'Mix material moisture', min: 0, max: 20, step: 0.1, unit: '%' }} />
      </Section>
    </>
  )
}
