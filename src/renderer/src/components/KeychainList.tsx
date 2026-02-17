import { useState } from 'react'
import { MoreHorizontal } from './icons'
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
      <div className="text-center text-base-content/40 py-8 text-xs">
        No keychain entries yet. Add one to get started.
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-0.5">
        {keychain.map((entry) => {
          const isSelected = selectedId === entry.id
          return (
            <ContextMenu
              key={entry.id}
              items={[
                {
                  label: 'Delete',
                  variant: 'danger',
                  onClick: () => setDeleteTarget(entry)
                }
              ]}
            >
              <button
                className={`group flex items-center gap-2.5 w-full rounded-xl px-2.5 py-2 transition-colors ${
                  isSelected
                    ? 'bg-primary/10 text-primary border-l-2 border-primary'
                    : 'hover:bg-base-content/5 text-base-content border-l-2 border-transparent'
                }`}
                onClick={() => onSelect(entry)}
              >
                <div className="flex flex-col items-start min-w-0 flex-1">
                  <span className="text-sm font-medium truncate w-full leading-tight">{entry.label}</span>
                  <span className="text-[11px] text-base-content/40 truncate w-full leading-tight">
                    {entry.username} &middot;{' '}
                    {entry.authType === 'key' ? 'SSH Key' : 'Password'}
                  </span>
                </div>

                <button
                  className="opacity-0 group-hover:opacity-100 btn btn-ghost btn-xs btn-square transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteTarget(entry)
                  }}
                  aria-label={`Options for ${entry.label}`}
                >
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </button>
              </button>
            </ContextMenu>
          )
        })}
      </div>

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
