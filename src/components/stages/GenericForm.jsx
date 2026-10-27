import { Section } from '../fields/Section'
import { renderField } from '../fields/Field'
import { useSimStore } from '../../store/useSimStore'

/** Renders any stage that declares `sections` in data/stages.js. */
export function GenericForm({ stage }) {
  const params = useSimStore((s) => s.params)
  return stage.sections(params).map((sec, i) => (
    <Section key={i} title={sec.title} note={sec.note} grid={sec.grid}>
      {sec.fields.map(renderField)}
    </Section>
  ))
}
