import { TerminalSquare, Plus } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({
  title,
  description,
  action
}: EmptyStateProps): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 select-none">
      <div className="w-16 h-16 rounded-2xl bg-base-200 flex items-center justify-center mb-6">
        <TerminalSquare className="w-8 h-8 text-base-content/20" />
      </div>
      <h2 className="text-base font-semibold text-base-content/70 mb-1.5">
        {title}
      </h2>
      <p className="text-sm text-base-content/40 mb-6 max-w-xs leading-relaxed">
        {description}
      </p>
      {action && (
        <button
          className="btn btn-primary btn-sm btn-outline gap-1.5"
          onClick={action.onClick}
        >
          <Plus className="w-4 h-4" />
          {action.label}
        </button>
      )}
    </div>
  )
}
