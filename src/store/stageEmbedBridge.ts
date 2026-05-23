import { getStageEmbedOrigin } from './stageEmbedConfig'

export const STAGE_EMBED_SET_STEP = 'atencium-set-step' as const
/** iframe → shell when user changes step inside the embed */
export const STAGE_EMBED_STEP_CHANGED = 'atencium-step-changed' as const
/** shell asks iframe for current step (polling fallback) */
export const STAGE_EMBED_REQUEST_STEP = 'atencium-request-step' as const

/** Ignore iframe → shell step sync briefly after the shell drives iframe navigation. */
const SHELL_NAV_LOCK_MS = 5000
let shellEmbedNavigationLockUntil = 0
let shellDrivenStepIndex = -1
let shellDrivenStepUntil = 0

let stageIframe: HTMLIFrameElement | null = null

export function registerStageEmbedFrame(frame: HTMLIFrameElement | null) {
  stageIframe = frame
}

export function markShellEmbedNavigation(stepIndex: number) {
  const now = Date.now()
  shellEmbedNavigationLockUntil = now + SHELL_NAV_LOCK_MS
  shellDrivenStepIndex = stepIndex
  shellDrivenStepUntil = now + SHELL_NAV_LOCK_MS
}

export function shouldIgnoreEmbedStepSync(): boolean {
  return Date.now() < shellEmbedNavigationLockUntil
}

/** Reject iframe step reports that do not match the shell-driven target (e.g. still on step 3 while navigating to 1). */
export function shouldRejectEmbedStepMismatch(embedStepIndex: number): boolean {
  if (Date.now() >= shellDrivenStepUntil) return false
  return embedStepIndex !== shellDrivenStepIndex
}

function embedTargetOrigin(): string {
  if (!stageIframe?.src) return getStageEmbedOrigin()
  try {
    return new URL(stageIframe.src, window.location.href).origin
  } catch {
    return getStageEmbedOrigin()
  }
}

export function postStageEmbedStep(step: number, path?: string) {
  const win = stageIframe?.contentWindow
  if (!win) return
  const payload: { type: typeof STAGE_EMBED_SET_STEP; step: number; path?: string } = {
    type: STAGE_EMBED_SET_STEP,
    step,
  }
  if (path?.trim()) payload.path = path.trim()
  win.postMessage(payload, embedTargetOrigin())
}

/** Ask the iframe to report its current step (legacy slot apps only). */
export function requestStageEmbedStep() {
  const win = stageIframe?.contentWindow
  if (!win) return
  win.postMessage({ type: STAGE_EMBED_REQUEST_STEP }, embedTargetOrigin())
}
