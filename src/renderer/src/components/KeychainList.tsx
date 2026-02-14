import { useState } from 'react'
import type { KeychainEntry } from '@shared/types'
import { ContextMenu } from './ContextMenu'
import { ConfirmDialog } from './ConfirmDialog'

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
  const [deleteTarget, setDeleteTarget] = useState<KeychainEntry | null>(null)

  if (keychain.length === 0) {
    return (
      <div className="text-center text-base-content/40 py-8 text-sm">
        No keychain entries yet. Add one to get started.
      </div>
    )
  }

  return (
    <>
      <ul className="menu menu-sm gap-1">
        {keychain.map((entry) => (
          <li key={entry.id}>
            <ContextMenu
              items={[
                {
                  label: 'Delete',
                  variant: 'danger',
                  onClick: () => setDeleteTarget(entry)
                }
              ]}
            >
              <button
                className={`flex items-center gap-2 w-full ${selectedId === entry.id ? 'active' : ''}`}
                onClick={() => onSelect(entry)}
              >
                <div className="flex flex-col items-start min-w-0">
                  <span className="font-medium truncate w-full">{entry.label}</span>
                  <span className="text-xs text-base-content/50 truncate w-full">
                    {entry.username} &middot;{' '}
                    {entry.authType === 'key' ? 'SSH Key' : 'Password'}
                  </span>
                </div>
              </button>
            </ContextMenu>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="Delete Keychain Entry"
        description={`Are you sure you want to delete "${deleteTarget?.label}"? Hosts using this entry will lose their credentials.`}
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleteTarget) onDelete(deleteTarget.id)
        }}
      />
    </>
  )
}
