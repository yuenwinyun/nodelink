import { useState } from 'react'
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
      <div className="text-center text-base-content/40 py-8 text-sm">
        No snippets yet. Add one to get started.
      </div>
    )
  }

  return (
    <>
      <ul className="menu menu-sm gap-1">
        {snippets.map((snippet) => (
          <li key={snippet.id}>
            <ContextMenu
              items={[
                {
                  label: 'Delete',
                  variant: 'danger',
                  onClick: () => setDeleteTarget(snippet)
                }
              ]}
            >
              <button
                className={`flex items-center gap-2 w-full ${selectedId === snippet.id ? 'active' : ''}`}
                onClick={() => onSelect(snippet)}
              >
                <div className="flex flex-col items-start min-w-0">
                  <span className="font-medium truncate w-full">{snippet.name}</span>
                  <span className="text-xs text-base-content/50 truncate w-full font-mono">
                    {snippet.command}
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
