import { useState } from 'react'
import type { Snippet } from '@shared/types'

interface SnippetPanelProps {
  snippets: Snippet[]
  onSend: (command: string) => void
  onClose: () => void
}

export function SnippetPanel({ snippets, onSend, onClose }: SnippetPanelProps): React.JSX.Element {
  const [filter, setFilter] = useState('')

  const filtered = snippets.filter(
    (s) =>
      s.name.toLowerCase().includes(filter.toLowerCase()) ||
      s.command.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div className="w-64 min-w-[256px] bg-base-200 border-l border-base-300 flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-base-300">
        <span className="font-medium text-sm">Snippets</span>
        <button className="btn btn-ghost btn-xs" onClick={onClose} title="Close panel">
          &times;
        </button>
      </div>

      <div className="px-3 py-2">
        <input
          type="text"
          className="input input-bordered input-sm w-full"
          placeholder="Filter snippets..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {filtered.length === 0 ? (
          <div className="text-center text-base-content/40 py-6 text-xs">
            {snippets.length === 0 ? 'No snippets yet.' : 'No matches.'}
          </div>
        ) : (
          <ul className="menu menu-sm gap-1">
            {filtered.map((snippet) => (
              <li key={snippet.id}>
                <button
                  className="flex flex-col items-start gap-0.5 w-full"
                  onClick={() => onSend(snippet.command)}
                  title={`Send: ${snippet.command}`}
                >
                  <span className="font-medium text-xs truncate w-full">{snippet.name}</span>
                  <span className="text-xs text-base-content/50 truncate w-full font-mono">
                    {snippet.command}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
