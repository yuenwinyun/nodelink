import { useState } from 'react'
import { MoreHorizontal } from './icons'
import type { Snippet } from '@shared/types'
import { ContextMenu } from './ContextMenu'
import { ConfirmDialog } from './ConfirmDialog'

interface SnippetListProps {
  snippets: Snippet[]
  selectedId: string | null
  onSelect: (snippet: Snippet) => void
  onDelete: (id: string) => void
}

export function SnippetList({
  snippets,
  selectedId,
  onSelect,
  onDelete
}: SnippetListProps): React.JSX.Element {
  const [deleteTarget, setDeleteTarget] = useState<Snippet | null>(null)

  if (snippets.length === 0) {
    return (
      <div className="text-center text-base-content/40 py-8 text-xs">
        No snippets yet. Add one to get started.
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-0.5">
        {snippets.map((snippet) => {
          const isSelected = selectedId === snippet.id
          return (
            <ContextMenu
              key={snippet.id}
              items={[
                {
                  label: 'Delete',
                  variant: 'danger',
                  onClick: () => setDeleteTarget(snippet)
                }
              ]}
            >
              <button
                className={`group flex items-center gap-2.5 w-full rounded-xl px-2.5 py-2 transition-colors ${
                  isSelected
                    ? 'bg-primary/10 text-primary border-l-2 border-primary'
                    : 'hover:bg-base-content/5 text-base-content border-l-2 border-transparent'
                }`}
                onClick={() => onSelect(snippet)}
              >
                <div className="flex flex-col items-start min-w-0 flex-1">
                  <span className="text-sm font-medium truncate w-full leading-tight">{snippet.name}</span>
                  <span className="text-[11px] text-base-content/40 truncate w-full font-mono leading-tight">
                    {snippet.command}
                  </span>
                </div>

                <button
                  className="opacity-0 group-hover:opacity-100 btn btn-ghost btn-xs btn-square transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteTarget(snippet)
                  }}
                  aria-label={`Options for ${snippet.name}`}
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
        title="Delete Snippet"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleteTarget) onDelete(deleteTarget.id)
        }}
      />
    </>
  )
}
