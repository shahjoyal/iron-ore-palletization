import { MotionConfig } from 'framer-motion'
import { Header } from './components/layout/Header'
import { ResetToast } from './components/layout/ResetToast'
import { Workspace } from './components/workspace/Workspace'
import { STAGE_BY_ID, stageView } from './data/stages'
import { useSimStore } from './store/useSimStore'

export default function App() {
  const active = useSimStore((s) => s.active)
  const params = useSimStore((s) => s.params)
  const stage = stageView(STAGE_BY_ID[active] || STAGE_BY_ID.feed, params)

  return (
    <MotionConfig reducedMotion="user">
      <div className="app">
        <Header />
        <Workspace stage={stage} mode={params.indu.mode} />
        <ResetToast />
      </div>
    </MotionConfig>
  )
}
