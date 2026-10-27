import { GenericForm } from './GenericForm'
import { FeedForm } from './FeedForm'
import { MixForm } from './MixForm'
import { InduForm } from './InduForm'
import { CoolForm } from './CoolForm'

const CUSTOM = { feed: FeedForm, mix: MixForm, indu: InduForm, cool: CoolForm }

/** Picks the form for a stage: a dedicated component or the schema-driven one. */
export function StageForm({ stage }) {
  const Custom = CUSTOM[stage.form]
  return Custom ? <Custom /> : <GenericForm stage={stage} />
}
