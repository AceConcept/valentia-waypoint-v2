import { create } from 'zustand'
import { useRef } from 'react'
import { STEP_DESCRIPTIONS, STEP_TITLES } from '../stepDescriptions'
import {
  markShellEmbedNavigation,
  postStageEmbedStep,
  shouldIgnoreEmbedStepSync,
  shouldRejectEmbedStepMismatch,
} from './stageEmbedBridge'
import {
  FLOW_STEP_IDS,
  POLAR_SYS_HASH,
  STAGE_EMBED_PATHS,
  stageEmbedUrlForStep,
  type FlowStepId,
} from './stageEmbedConfig'

export type { FlowStepId } from './stageEmbedConfig'
export {
  FLOW_STEP_IDS,
  getStageEmbedOrigin,
  POLAR_SYS_HASH,
  STAGE_EMBED_ORIGIN,
  STAGE_EMBED_PATHS,
} from './stageEmbedConfig'

/** Map `#1` … `#3` (or legacy `#/N`) to step ids. */
export function polarFlowIdFromHash(hash: string): FlowStepId {
  const segment = String(hash || '')
    .replace(/^#/, '')
    .replace(/^\//, '')
    .trim()
  if (FLOW_STEP_IDS.includes(segment as FlowStepId)) {
    return segment as FlowStepId
  }
  return '1'
}

export const FLOW_STEPS: {
  id: FlowStepId
  title: string
  body: string
}[] = FLOW_STEP_IDS.map((id, i) => ({
  id,
  title: STEP_TITLES[i] ?? STEP_TITLES[0],
  body: STEP_DESCRIPTIONS[i] ?? STEP_DESCRIPTIONS[0],
}))

function initialStepIndexFromLocation(): number {
  if (typeof window === 'undefined') return 0
  const id = polarFlowIdFromHash(window.location.hash)
  const index = FLOW_STEPS.findIndex((s) => s.id === id)
  return index >= 0 ? index : 0
}

type FlowState = {
  stepIndex: number
  /** Latest iframe path from Valentia (fullscreen handoff only — main iframe src stays fixed). */
  liveEmbedPath: string | undefined
  next: () => void
  back: () => void
  goToStep: (index: number) => void
  goToStepById: (id: FlowStepId) => void
  /** Shell trackers only — iframe already navigated (avoids round-trip). */
  syncStepFromEmbed: (id: FlowStepId, embedPath?: string) => void
  reset: () => void
}

export const useFlowStore = create<FlowState>((set, get) => ({
  stepIndex: initialStepIndexFromLocation(),
  liveEmbedPath: undefined,
  next: () => {
    const i = get().stepIndex
    if (i < FLOW_STEPS.length - 1) get().goToStepById(FLOW_STEPS[i + 1].id)
  },
  back: () => {
    const i = get().stepIndex
    if (i > 0) get().goToStepById(FLOW_STEPS[i - 1].id)
  },
  goToStep: (index) => {
    if (index >= 0 && index < FLOW_STEPS.length) get().goToStepById(FLOW_STEPS[index].id)
  },
  goToStepById: (id) => {
    const index = FLOW_STEPS.findIndex((s) => s.id === id)
    if (index < 0) return
    set({
      stepIndex: index,
      liveEmbedPath: id === '1' ? undefined : get().liveEmbedPath,
    })
    if (typeof window !== 'undefined') {
      markShellEmbedNavigation(index)
      const hash = POLAR_SYS_HASH[id]
      if (window.location.hash !== hash) {
        const url = new URL(window.location.href)
        url.hash = hash
        window.history.replaceState(null, '', url)
      }
      postStageEmbedStep(Number(id), STAGE_EMBED_PATHS[id])
    }
  },
  syncStepFromEmbed: (id, embedPath) => {
    const index = FLOW_STEPS.findIndex((s) => s.id === id)
    if (index < 0) return
    if (shouldIgnoreEmbedStepSync()) return
    if (shouldRejectEmbedStepMismatch(index)) return
    const sameStep = get().stepIndex === index
    const pathUnchanged =
      !embedPath || embedPath === get().liveEmbedPath
    if (sameStep && pathUnchanged) return
    set({
      stepIndex: index,
      liveEmbedPath: embedPath ?? get().liveEmbedPath,
    })
    if (typeof window !== 'undefined' && !sameStep) {
      const hash = POLAR_SYS_HASH[id]
      if (window.location.hash !== hash) {
        const url = new URL(window.location.href)
        url.hash = hash
        window.history.replaceState(null, '', url)
      }
    }
  },
  reset: () => set({ stepIndex: 0, liveEmbedPath: undefined }),
}))

export function useFlowStep() {
  const stepIndex = useFlowStore((s) => s.stepIndex)
  const step = FLOW_STEPS[stepIndex]
  const isFirst = stepIndex === 0
  const isLast = stepIndex === FLOW_STEPS.length - 1
  return { stepIndex, step, isFirst, isLast }
}

/** One-time iframe `src` from URL hash — shell step changes use postMessage only. */
export function useInitialStageEmbedSrc(): string {
  const ref = useRef<string | null>(null)
  if (ref.current === null) {
    const id =
      typeof window !== 'undefined'
        ? polarFlowIdFromHash(window.location.hash)
        : ('1' as FlowStepId)
    ref.current = stageEmbedUrlForStep(id)
  }
  return ref.current
}

/** Current iframe location for fullscreen remount (not used for the main stage iframe). */
export function useLiveStageEmbedSrc(): string {
  const livePath = useFlowStore((s) => s.liveEmbedPath)
  const stepId = useFlowStore((s) => FLOW_STEPS[s.stepIndex]?.id ?? '1')
  return stageEmbedUrlForStep(stepId, livePath)
}
