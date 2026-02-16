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
    <header className="flex items-center h-10 bg-base-200/50 border-b border-base-content/5 shrink-0">
      <div className="flex items-stretch overflow-x-auto flex-1 min-w-0 scrollbar-none">
        {sessions.map((session) => {
          const isActive = session.sessionId === activeSessionId
          const isLocal = session.type === 'local'
          const label = isLocal ? 'Local Terminal' : session.host.name
          const statusColor = isLocal ? 'bg-info' : 'bg-success'
          return (
            <button
              key={session.sessionId}
              role="tab"
              aria-selected={isActive}
              className={`group relative flex items-center gap-1.5 px-3 h-full text-xs shrink-0 transition-colors cursor-pointer ${
                isActive
                  ? 'text-base-content'
                  : 'text-base-content/50 hover:text-base-content/80 hover:bg-base-300/30'
              }`}
              onClick={() => onSwitch(session.sessionId)}
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusColor}`} />
              <span className="truncate max-w-28">{label}</span>
              <span
                className="ml-1 opacity-0 group-hover:opacity-100 text-base-content/40 hover:text-error transition-opacity text-sm leading-none"
                onClick={(e) => {
                  e.stopPropagation()
                  onDisconnect(session.sessionId)
                }}
                role="button"
                aria-label={isLocal ? 'Close terminal' : 'Disconnect session'}
              >
                &times;
              </span>
              {isActive && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          )
        })}
      </div>
    </header>
  )
}
