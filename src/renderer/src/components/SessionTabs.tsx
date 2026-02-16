import type { TerminalSession } from '../hooks/useAppNavigation'

interface SessionTabsProps {
  sessions: TerminalSession[]
  activeSessionId: string | null
  onSwitch: (sessionId: string) => void
  onDisconnect: (sessionId: string) => void
}

export function SessionTabs({
  sessions,
  activeSessionId,
  onSwitch,
  onDisconnect
}: SessionTabsProps): React.JSX.Element | null {
  if (sessions.length === 0) return null

  return (
    <div className="flex items-center bg-base-200 border-b border-base-300 overflow-x-auto">
      {sessions.map((session) => {
        const isActive = session.sessionId === activeSessionId
        const isLocal = session.type === 'local'
        const label = isLocal ? 'Local Terminal' : session.host.name
        return (
          <div
            key={session.sessionId}
            className={`group flex items-center gap-1.5 px-3 py-1.5 text-sm cursor-pointer border-r border-base-300 shrink-0 transition-colors ${
              isActive
                ? 'bg-base-300 text-base-content'
                : 'text-base-content/60 hover:bg-base-300/50 hover:text-base-content'
            }`}
            onClick={() => onSwitch(session.sessionId)}
          >
            <span className={`badge badge-xs ${isLocal ? 'badge-info' : 'badge-success'}`} />
            <span className="truncate max-w-[120px]">{label}</span>
            <button
              className="btn btn-ghost btn-xs px-0.5 py-0 min-h-0 h-auto text-base-content/40 hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation()
                onDisconnect(session.sessionId)
              }}
              title={isLocal ? 'Close terminal' : 'Disconnect session'}
            >
              &times;
            </button>
          </div>
        )
      })}
    </div>
  )
}
