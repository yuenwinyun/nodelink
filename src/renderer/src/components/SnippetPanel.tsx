import { useState } from 'react'
import { X } from './icons'
import { SearchInput } from './SearchInput'
import type { Snippet } from '@shared/types'

interface SnippetPanelProps {
  snippets: Snippet[]
  isOpen: boolean
  onSend: (command: string) => void
  onClose: () => void
}

export function SnippetPanel({ snippets, isOpen, onSend, onClose }: SnippetPanelProps): React.JSX.Element {
  const [filter, setFilter] = useState('')

  const filtered = snippets.filter(
    (s) =>
      s.name.toLowerCase().includes(filter.toLowerCase()) ||
      s.command.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div className={`
      bg-base-200 border-l border-base-content/5 flex flex-col h-full
      transition-all duration-200 ease-out overflow-hidden
      ${isOpen ? 'w-80 min-w-[320px] opacity-100 animate-slide-in-right shadow-xl' : 'w-0 min-w-0 opacity-0'}
    `}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-base-content/5">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">Snippets</span>
          <span className="badge badge-xs badge-ghost">{snippets.length}</span>
        </div>
        <button
          className="btn btn-ghost btn-xs btn-square"
          onClick={onClose}
          aria-label="Close snippets panel"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="px-3 py-2">
        <SearchInput
          value={filter}
          onChange={setFilter}
          placeholder="Filter snippets..."
        />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-2 pb-2">
        {filtered.length === 0 ? (
          <div className="text-center text-base-content/40 py-6 text-xs">
            {snippets.length === 0 ? 'No snippets yet.' : 'No matches.'}
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {filtered.map((snippet) => (
              <button
                key={snippet.id}
                className="flex flex-col items-start gap-0.5 w-full rounded-xl px-2.5 py-2 transition-colors hover:bg-base-content/5"
                onClick={() => onSend(snippet.command)}
                title={`Send: ${snippet.command}`}
              >
                <span className="font-medium text-xs truncate w-full text-left">{snippet.name}</span>
                <span className="text-[11px] text-base-content/40 truncate w-full font-mono text-left">
                  {snippet.command}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
