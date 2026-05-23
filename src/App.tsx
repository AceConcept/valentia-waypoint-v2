import { LunaChrome } from './luna/LunaChrome'
import { WaypointSidebar } from './luna/WaypointSidebar'
import WaypointStepsScreen from './steps/WaypointStepsScreen'
import { FLOW_SIDEBAR_ITEMS } from './flowSidebarItems'
import { useEffect } from 'react'
import {
  FLOW_STEP_IDS,
  useFlowStep,
  useFlowStore,
  type FlowStepId,
} from './store/flowStore'
import {
  shouldIgnoreEmbedStepSync,
  shouldRejectEmbedStepMismatch,
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
    const embedOrigin = getStageEmbedOrigin()
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== embedOrigin) return
      if (event.data?.type !== STAGE_EMBED_STEP_CHANGED) return
      const n = Number(event.data.step)
      if (!Number.isFinite(n) || n < 1 || n > FLOW_STEP_IDS.length) return
      const id = String(n) as FlowStepId
      if (!FLOW_STEP_IDS.includes(id)) return
      const embedIndex = FLOW_STEP_IDS.indexOf(id)
      if (shouldIgnoreEmbedStepSync()) return
      if (shouldRejectEmbedStepMismatch(embedIndex)) return
      const embedPath =
        typeof event.data.path === 'string' ? event.data.path : undefined
      syncStepFromEmbed(id, embedPath)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [syncStepFromEmbed])

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
