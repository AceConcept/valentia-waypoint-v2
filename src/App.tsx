import { LunaChrome } from './luna/LunaChrome'
import { LoadingScreen } from './luna/LoadingScreen'
import { getLoadscreenPreview } from './luna/loadscreenPreview'
import WaypointStepsScreen from './steps/WaypointStepsScreen'
import { useCallback, useEffect, useMemo, useState } from 'react'
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

function App() {
  const { stepIndex } = useFlowStep()
  const syncStepFromEmbed = useFlowStore((s) => s.syncStepFromEmbed)
  const [loadscreenDone, setLoadscreenDone] = useState(false)
  const [loadKey, setLoadKey] = useState(() => Date.now())
  const loadscreenPreview = useMemo(() => getLoadscreenPreview(), [])
  const showLoadscreen = loadscreenPreview.hold || !loadscreenDone
  const handleLoadscreenComplete = useCallback(() => setLoadscreenDone(true), [])

  useEffect(() => {
    const nav = performance.getEntriesByType('navigation')[0] as
      | PerformanceNavigationTiming
      | undefined
    if (nav?.type === 'reload') {
      setLoadscreenDone(false)
      setLoadKey(Date.now())
    }
  }, [])

  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return
      setLoadscreenDone(false)
      setLoadKey(Date.now())
    }
    window.addEventListener('pageshow', onPageShow)
    return () => window.removeEventListener('pageshow', onPageShow)
  }, [])

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
    <>
      <div className="app-shell">
        <LunaChrome footerBackgroundUrl="/news_bg.jpg">
          <WaypointStepsScreen />
        </LunaChrome>
      </div>
      {showLoadscreen ? (
        <LoadingScreen
          key={loadKey}
          hold={loadscreenPreview.hold}
          progress={
            loadscreenPreview.hold ? loadscreenPreview.progress : undefined
          }
          onComplete={handleLoadscreenComplete}
        />
      ) : null}
    </>
  )
}

export default App
