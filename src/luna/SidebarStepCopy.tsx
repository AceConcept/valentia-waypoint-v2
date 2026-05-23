import type { StepCopyBlock } from '../stepDescriptions'

type SidebarStepCopyProps = {
  blocks: readonly StepCopyBlock[]
  className?: string
  paragraphClassName?: string
  listClassName?: string
}

export function SidebarStepCopy({
  blocks,
  className,
  paragraphClassName = 'sidebar-step-copy__paragraph',
  listClassName = 'sidebar-step-copy__list',
}: SidebarStepCopyProps) {
  return (
    <div className={className ?? 'sidebar-step-copy'}>
      {blocks.map((block, index) => {
        if (block.kind === 'paragraph') {
          return (
            <p key={index} className={paragraphClassName}>
              {block.text}
            </p>
          )
        }
        if (block.kind === 'callout') {
          return (
            <p key={index} className="sidebar-step-copy__callout">
              <strong>{block.text}</strong>
            </p>
          )
        }
        return (
          <ul key={index} className={listClassName}>
            {block.items.map((item) => (
              <li key={item.label}>
                <strong>{item.label}:</strong> {item.text}
              </li>
            ))}
          </ul>
        )
      })}
    </div>
  )
}
