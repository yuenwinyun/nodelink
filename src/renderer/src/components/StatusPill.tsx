type StatusType = 'connecting' | 'connected' | 'disconnected' | 'error' | 'starting' | 'running' | 'exited'

interface StatusPillProps {
  status: StatusType
}

const config: Record<StatusType, { label: string; className: string; loading?: boolean }> = {
  connecting: { label: 'Connecting', className: 'badge-warning badge-outline', loading: true },
  connected: { label: 'Live', className: 'badge-success badge-outline' },
  disconnected: { label: 'Disconnected', className: 'badge-ghost' },
  error: { label: 'Error', className: 'badge-error badge-outline' },
  starting: { label: 'Starting', className: 'badge-info badge-outline', loading: true },
  running: { label: 'Running', className: 'badge-info badge-outline' },
  exited: { label: 'Exited', className: 'badge-ghost' }
}

export function StatusPill({ status }: StatusPillProps): React.JSX.Element {
  const c = config[status]
  return (
    <span className={`badge badge-xs gap-1 ${c.className}`}>
      {c.loading && <span className="loading loading-spinner w-2 h-2" />}
      {c.label}
    </span>
  )
}
