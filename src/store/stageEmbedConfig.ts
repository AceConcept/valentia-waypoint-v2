/** Generic numbered step ids (1–3). */
export type FlowStepId = '1' | '2' | '3'

export const FLOW_STEP_IDS = ['1', '2', '3'] as const satisfies readonly FlowStepId[]

/** Must match steps-project-slot hash routes (`#1` … `#3`, not `#/1`). */
export const POLAR_SYS_HASH: Record<FlowStepId, string> = {
  '1': '#1',
  '2': '#2',
  '3': '#3',
}

/** iframe target — https://steps-project-slot.vercel.app (#1 … #3) */
export const STAGE_EMBED_ORIGIN = 'https://steps-project-slot.vercel.app'

export function getStageEmbedOrigin(): string {
  const envOrigin = import.meta.env.VITE_STAGE_EMBED_ORIGIN as string | undefined
  if (envOrigin?.trim()) return envOrigin.trim().replace(/\/$/, '')
  return STAGE_EMBED_ORIGIN
}

export function stageEmbedUrl(polarHash: string): string {
  const base = getStageEmbedOrigin().replace(/\/$/, '')
  return `${base}${polarHash}`
}

export function stageEmbedUrlForStep(id: FlowStepId): string {
  return stageEmbedUrl(POLAR_SYS_HASH[id])
}
