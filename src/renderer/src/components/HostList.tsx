import { useState } from 'react'
import type { Host } from '@shared/types'
import { ContextMenu } from './ContextMenu'
import { ConfirmDialog } from './ConfirmDialog'

interface HostListProps {
  hosts: Host[]
  selectedId: string | null
  connectedHostIds: Set<string>
  onSelect: (host: Host) => void
  onConnect: (host: Host) => void
  onResume: (hostId: string) => void
  onDelete: (id: string) => void
}

export function HostList({
  hosts,
  selectedId,
  connectedHostIds,
  onSelect,
  onConnect,
  onResume,
  onDelete
}: HostListProps): React.JSX.Element {
  const [deleteTarget, setDeleteTarget] = useState<Host | null>(null)

  if (hosts.length === 0) {
    return (
      <div className="text-center text-base-content/40 py-8 text-sm">
        No hosts yet. Add one to get started.
      </div>
    )
  }

  return (
    <>
      <ul className="menu menu-sm gap-1">
        {hosts.map((host) => (
          <li key={host.id}>
            <ContextMenu
              items={[
                {
                  label: 'New Session',
                  onClick: () => onConnect(host)
                },
                {
                  label: 'Delete',
                  variant: 'danger',
                  onClick: () => setDeleteTarget(host)
                }
              ]}
            >
              <button
                className={`flex items-center gap-2 w-full ${selectedId === host.id ? 'active' : ''}`}
                onClick={() =>
                  connectedHostIds.has(host.id) ? onResume(host.id) : onSelect(host)
                }
                onDoubleClick={() => onConnect(host)}
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
            </ContextMenu>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="Delete Host"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleteTarget) onDelete(deleteTarget.id)
        }}
      />
    </>
  )
}
