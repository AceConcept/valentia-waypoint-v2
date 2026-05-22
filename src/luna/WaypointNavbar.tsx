import { useCallback } from 'react'
import {
  FLOW_STEPS,
  useFlowStep,
  useFlowStore,
  type FlowStepId,
} from '../store/flowStore'

const NAV_STEPS: {
  className: string
  label: string
  flowId: FlowStepId
}[] = [
  { className: 'step-1', label: 'Step One', flowId: FLOW_STEPS[0]?.id ?? '1' },
  { className: 'step-2', label: 'Step Two', flowId: FLOW_STEPS[1]?.id ?? '2' },
  { className: 'step-3', label: 'Step Three', flowId: FLOW_STEPS[2]?.id ?? '3' },
]

type StepTabProps = {
  className: string
  label: string
  flowId: FlowStepId
  isCurrent: boolean
  onSelect: (id: FlowStepId) => void
}

function StepTab({ className, label, flowId, isCurrent, onSelect }: StepTabProps) {
  return (
    <button
      type="button"
      className={`step-tab ${className}`}
      aria-current={isCurrent ? 'step' : undefined}
      onClick={() => onSelect(flowId)}
    >
      <span className="step-label">
        <span className="step-label-inner">
          <span className="step-diamond" aria-hidden="true" />
          <span className="step-label-text">{label}</span>
        </span>
      </span>
    </button>
  )
}

export function WaypointNavbar() {
  const { step } = useFlowStep()
  const goToStepById = useFlowStore((s) => s.goToStepById)

  const selectStep = useCallback(
    (id: FlowStepId) => {
      goToStepById(id)
    },
    [goToStepById],
  )

  return (
    <div className="luna-absolute-pad">
      <div className="waypoint-navbar">
        <div className="navbar-left">
          <div className="navbar-left-brand">
            <a
              className="navbar-left-label"
              href="https://www.atencium-ui.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              atencium-ui.com
            </a>
          </div>
        </div>
        <div className="navbar-steps">
          {NAV_STEPS.map(({ className, label, flowId }) => (
            <StepTab
              key={className}
              className={className}
              label={label}
              flowId={flowId}
              isCurrent={step.id === flowId}
              onSelect={selectStep}
            />
          ))}
        </div>
        <div className="navbar-right" />
      </div>
    </div>
  )
}
