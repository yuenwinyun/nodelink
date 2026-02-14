import type { Host } from '@shared/types'

interface HostListProps {
  hosts: Host[]
  selectedId: string | null
  connectedHostIds: Set<string>
  onSelect: (host: Host) => void
  onConnect: (host: Host) => void
  onDelete: (id: string) => void
}

export function HostList({
  hosts,
  selectedId,
  connectedHostIds,
  onSelect,
  onConnect,
  onDelete
}: HostListProps): React.JSX.Element {
  if (hosts.length === 0) {
    return (
      <div className="text-center text-base-content/40 py-8 text-sm">
        No hosts yet. Add one to get started.
      </div>
    )
  }

  return (
    <ul className="menu menu-sm gap-1">
      {hosts.map((host) => (
        <li key={host.id}>
          <button
            className={`flex items-center gap-2 ${selectedId === host.id ? 'active' : ''}`}
            onClick={() => onSelect(host)}
            onDoubleClick={() => onConnect(host)}
            onContextMenu={(e) => {
              e.preventDefault()
              if (confirm(`Delete "${host.name}"?`)) {
                onDelete(host.id)
              }
            }}
          >
            {connectedHostIds.has(host.id) && (
              <span className="badge badge-xs badge-success" />
            )}
            <div className="flex flex-col items-start min-w-0">
              <span className="font-medium truncate w-full">{host.name}</span>
              <span className="text-xs text-base-content/50 truncate w-full">
                {host.username}@{host.address}:{host.port}
              </span>
            </div>
          </button>
        </li>
      ))}
    </ul>
  )
}
