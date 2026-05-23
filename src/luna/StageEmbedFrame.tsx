import { useEffect, useRef } from 'react'
import { registerStageEmbedFrame } from '../store/stageEmbedBridge'

type StageEmbedFrameProps = {
  src: string
  title: string
  className?: string
}

/** iframe points at Valentia; `src` is set once — step changes go through postMessage. */
export function StageEmbedFrame({ src, title, className }: StageEmbedFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    registerStageEmbedFrame(iframeRef.current)
    return () => registerStageEmbedFrame(null)
  }, [])

  return (
    <iframe
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
