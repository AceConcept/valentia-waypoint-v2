import { LunaChrome } from './luna/LunaChrome'
import { WaypointSidebar } from './luna/WaypointSidebar'
import WaypointStepsScreen from './steps/WaypointStepsScreen'
import { FLOW_SIDEBAR_ITEMS } from './flowSidebarItems'
import { useEffect } from 'react'
import {
  FLOW_STEP_IDS,
  FLOW_STEPS,
  useFlowStep,
  useFlowStore,
  type FlowStepId,
} from './store/flowStore'
import {
  requestStageEmbedStep,
  STAGE_EMBED_STEP_CHANGED,
} from './store/stageEmbedBridge'
import { getStageEmbedOrigin } from './store/stageEmbedConfig'
import './App.css'

const RAIL_LABEL = 'Waypoint guide'

function App() {
  const { step, stepIndex } = useFlowStep()
  const goToStepById = useFlowStore((s) => s.goToStepById)
  const syncStepFromEmbed = useFlowStore((s) => s.syncStepFromEmbed)

  useEffect(() => {
    const { stepIndex } = useFlowStore.getState()
    const initial = FLOW_STEPS[stepIndex]
    if (initial) goToStepById(initial.id)
  }, [goToStepById])

  useEffect(() => {
    const embedOrigin = getStageEmbedOrigin()
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== embedOrigin) return
      if (event.data?.type !== STAGE_EMBED_STEP_CHANGED) return
      const n = Number(event.data.step)
      if (!Number.isFinite(n) || n < 1 || n > FLOW_STEP_IDS.length) return
      const id = String(n) as FlowStepId
      if (!FLOW_STEP_IDS.includes(id)) return
      syncStepFromEmbed(id)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [syncStepFromEmbed])

  useEffect(() => {
    const poll = window.setInterval(() => requestStageEmbedStep(), 400)
    return () => window.clearInterval(poll)
  }, [])

  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem('atencium-step', String(stepIndex + 1))
    } catch {
      /* ignore */
    }
  }

  return (
    <LunaChrome
      footerBackgroundUrl="/news_bg.jpg"
      sidebar={({ expanded, onExpandedChange }) => (
        <div className="waypoint-sidebar">
          <WaypointSidebar
            items={FLOW_SIDEBAR_ITEMS}
            expanded={expanded}
            onExpandedChange={onExpandedChange}
            initialActiveId={step.id}
            onActiveItemChange={(id) => {
              const hit = FLOW_SIDEBAR_ITEMS.find((item) => item.id === id)
              if (hit) goToStepById(hit.id)
            }}
            railLabel={RAIL_LABEL}
          />
        </div>
      )}
    >
      <WaypointStepsScreen />
    </LunaChrome>
  )
}

export default App
