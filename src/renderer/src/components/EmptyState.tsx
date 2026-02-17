import { TerminalSquare, Plus } from './icons'

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
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-6">
        <TerminalSquare className="w-10 h-10 text-primary/60" />
      </div>
      <h2 className="text-lg font-semibold text-base-content/70 mb-1.5">
        {title}
      </h2>
      <p className="text-sm text-base-content/40 mb-2 max-w-xs leading-relaxed">
        {description}
      </p>
      <p className="text-xs text-base-content/30 mb-6">
        Press <kbd className="kbd kbd-xs">⌘K</kbd> to search
      </p>
      {action && (
        <button
          className="btn btn-primary btn-sm btn-outline gap-1.5 rounded-lg"
          onClick={action.onClick}
        >
          <Plus className="w-4 h-4" />
          {action.label}
        </button>
      )}
    </div>
  )
}
