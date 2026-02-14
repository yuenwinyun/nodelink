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
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <h2 className="text-lg font-semibold text-base-content/60 mb-2">
        {title}
      </h2>
      <p className="text-sm text-base-content/40 mb-4 max-w-sm">
        {description}
      </p>
      {action && (
        <button className="btn btn-primary btn-sm" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  )
}
