import { useState } from 'react'
import { MoreHorizontal } from './icons'
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
      <div className="text-center text-base-content/40 py-8 text-xs">
        No hosts yet. Add one to get started.
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-0.5">
        {hosts.map((host) => {
          const isSelected = selectedId === host.id
          const isConnected = connectedHostIds.has(host.id)
          return (
            <ContextMenu
              key={host.id}
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
                className={`group flex items-center gap-2.5 w-full rounded-lg px-2.5 py-2 transition-colors ${
                  isSelected
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-base-300/60 text-base-content'
                }`}
                onClick={() =>
                  isConnected ? onResume(host.id) : onSelect(host)
                }
                onDoubleClick={() => onConnect(host)}
              >
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  isConnected ? 'bg-success shadow-[0_0_6px_theme(colors.success/40%)]' : 'bg-base-content/20'
                }`} />

                <div className="flex flex-col items-start min-w-0 flex-1">
                  <span className="text-sm font-medium truncate w-full leading-tight">{host.name}</span>
                  <span className="text-[11px] text-base-content/40 truncate w-full leading-tight">
                    {host.username}@{host.address}
                  </span>
                </div>

                <button
                  className="opacity-0 group-hover:opacity-100 btn btn-ghost btn-xs btn-square transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteTarget(host)
                  }}
                  aria-label={`Options for ${host.name}`}
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
