import { useEffect, useRef } from 'react'
import { registerStageEmbedFrame } from '../store/stageEmbedBridge'

type StageEmbedFrameProps = {
  src: string
  title: string
  className?: string
  /** Remount iframe when the shell step changes (avoids / vs /?query src fights). */
  stepKey: string
}

/** iframe points at Valentia; one load per step via `stepKey`. */
export function StageEmbedFrame({ src, title, className, stepKey }: StageEmbedFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    registerStageEmbedFrame(iframeRef.current)
    return () => registerStageEmbedFrame(null)
  }, [stepKey])

  return (
    <iframe
      key={stepKey}
      ref={iframeRef}
      className={className}
      src={src}
      title={title}
      allow="fullscreen"
      loading="eager"
      referrerPolicy="strict-origin-when-cross-origin"
    />
  )
}
