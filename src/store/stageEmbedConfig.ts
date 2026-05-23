/** Generic numbered step ids (1–3). */
export type FlowStepId = '1' | '2' | '3'

export const FLOW_STEP_IDS = ['1', '2', '3'] as const satisfies readonly FlowStepId[]

/** Shell URL hash only (`#1` … `#3`) — not passed to the iframe. */
export const POLAR_SYS_HASH: Record<FlowStepId, string> = {
  '1': '#1',
  '2': '#2',
  '3': '#3',
}

/** iframe path per step (appended to embed origin). Step 1 = home with charts reset (no query). */
export const STAGE_EMBED_PATHS: Record<FlowStepId, string> = {
  '1': '/',
  '2': '/?chart=BTCUSDT&compare=SOLUSDT',
  '3': '/insight/btcusdt-solusdt',
}

/** iframe target — https://valentia.guildconcept.workers.dev */
export const STAGE_EMBED_ORIGIN = 'https://valentia.guildconcept.workers.dev'

export function getStageEmbedOrigin(): string {
  const envOrigin = import.meta.env.VITE_STAGE_EMBED_ORIGIN as string | undefined
  if (envOrigin?.trim()) return envOrigin.trim().replace(/\/$/, '')
  return STAGE_EMBED_ORIGIN
}

export function stageEmbedUrlForStep(
  id: FlowStepId,
  pathOverride?: string | null,
): string {
  const base = getStageEmbedOrigin().replace(/\/$/, '')
  const path = pathOverride?.trim() ? pathOverride.trim() : STAGE_EMBED_PATHS[id]
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}
