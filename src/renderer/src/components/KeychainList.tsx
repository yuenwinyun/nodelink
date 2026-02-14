import type { KeychainEntry } from '@shared/types'

interface KeychainListProps {
  keychain: KeychainEntry[]
  selectedId: string | null
  onSelect: (entry: KeychainEntry) => void
  onDelete: (id: string) => void
}

export function KeychainList({
  keychain,
  selectedId,
  onSelect,
  onDelete
}: KeychainListProps): React.JSX.Element {
  if (keychain.length === 0) {
    return (
      <div className="text-center text-base-content/40 py-8 text-sm">
        No keychain entries yet. Add one to get started.
      </div>
    )
  }

  return (
    <ul className="menu menu-sm gap-1">
      {keychain.map((entry) => (
        <li key={entry.id}>
          <button
            className={`flex items-center gap-2 ${selectedId === entry.id ? 'active' : ''}`}
            onClick={() => onSelect(entry)}
            onContextMenu={(e) => {
              e.preventDefault()
              if (confirm(`Delete "${entry.label}"?`)) {
                onDelete(entry.id)
              }
            }}
          >
            <div className="flex flex-col items-start min-w-0">
              <span className="font-medium truncate w-full">{entry.label}</span>
              <span className="text-xs text-base-content/50 truncate w-full">
                {entry.username} · {entry.authType === 'key' ? 'SSH Key' : 'Password'}
              </span>
            </div>
          </button>
        </li>
      ))}
    </ul>
  )
}
