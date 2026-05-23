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
      {blocks.map((block, index) =>
        block.kind === 'paragraph' ? (
          <p key={index} className={paragraphClassName}>
            {block.text}
          </p>
        ) : (
          <ul key={index} className={listClassName}>
            {block.items.map((item) => (
              <li key={item.label}>
                <strong>{item.label}:</strong> {item.text}
              </li>
            ))}
          </ul>
        ),
      )}
    </div>
  )
}
