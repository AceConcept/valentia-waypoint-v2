import { getStageEmbedOrigin } from './stageEmbedConfig'

export const STAGE_EMBED_SET_STEP = 'atencium-set-step' as const
/** iframe → shell when user changes step inside the embed */
export const STAGE_EMBED_STEP_CHANGED = 'atencium-step-changed' as const
/** shell asks iframe for current step (polling fallback) */
export const STAGE_EMBED_REQUEST_STEP = 'atencium-request-step' as const

/** Ignore iframe → shell step sync briefly after the shell changes iframe src. */
const SHELL_NAV_LOCK_MS = 2000
let shellEmbedNavigationLockUntil = 0

let stageIframe: HTMLIFrameElement | null = null

export function registerStageEmbedFrame(frame: HTMLIFrameElement | null) {
  stageIframe = frame
}

export function markShellEmbedNavigation() {
  shellEmbedNavigationLockUntil = Date.now() + SHELL_NAV_LOCK_MS
}

export function shouldIgnoreEmbedStepSync(): boolean {
  return Date.now() < shellEmbedNavigationLockUntil
}

function embedTargetOrigin(): string {
  if (!stageIframe?.src) return getStageEmbedOrigin()
  try {
    return new URL(stageIframe.src, window.location.href).origin
  } catch {
    return getStageEmbedOrigin()
  }
}

export function postStageEmbedStep(step: number) {
  const win = stageIframe?.contentWindow
  if (!win) return
  win.postMessage({ type: STAGE_EMBED_SET_STEP, step }, embedTargetOrigin())
}

/** Ask the iframe to report its current step (legacy slot apps only). */
export function requestStageEmbedStep() {
  const win = stageIframe?.contentWindow
  if (!win) return
  win.postMessage({ type: STAGE_EMBED_REQUEST_STEP }, embedTargetOrigin())
}
