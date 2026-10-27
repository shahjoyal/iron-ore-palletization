import { createFeedScene } from './feed'
import { createGrindScene } from './grind'
import { createThickScene } from './thick'
import { createFilterScene } from './filter'
import { createMixScene } from './mix'
import { createBallScene } from './ball'
import { createGreenballScene } from './greenball'
import { createCoolScene } from './cool'

/** stage id -> factory that paints onto a canvas. Induration is SVG, see induSvg.js */
export const SCENES = {
  feed: createFeedScene,
  grind: createGrindScene,
  thickner: createThickScene,
  filter: createFilterScene,
  mix: createMixScene,
  ball: createBallScene,
  greenball: createGreenballScene,
  cool: createCoolScene,
}
