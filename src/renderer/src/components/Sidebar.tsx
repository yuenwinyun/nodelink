import { Plus, TerminalSquare } from './icons'
import type { Host, KeychainEntry, Snippet } from '@shared/types'
import type { Tab } from '../types'
import { HostList } from './HostList'
import { KeychainList } from './KeychainList'
import { SnippetList } from './SnippetList'

interface SidebarProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  hosts: Host[]
  keychain: KeychainEntry[]
  snippets: Snippet[]
  loading: boolean
  selectedId: string | null
  connectedHostIds: Set<string>
  onSelectHost: (host: Host) => void
  onSelectKeychain: (entry: KeychainEntry) => void
  onSelectSnippet: (snippet: Snippet) => void
  onConnectHost: (host: Host) => void
  onResumeHost: (hostId: string) => void
  onAddHost: () => void
  onAddKeychain: () => void
  onAddSnippet: () => void
  onDeleteHost: (id: string) => void
  onDeleteKeychain: (id: string) => void
  onDeleteSnippet: (id: string) => void
  onOpenLocalTerminal: () => void
}

export function Sidebar({
  activeTab,
  onTabChange,
  hosts,
  keychain,
  snippets,
  loading,
  selectedId,
  connectedHostIds,
  onSelectHost,
  onSelectKeychain,
  onSelectSnippet,
  onConnectHost,
  onResumeHost,
  onAddHost,
  onAddKeychain,
  onAddSnippet,
  onDeleteHost,
  onDeleteKeychain,
  onDeleteSnippet,
  onOpenLocalTerminal
}: SidebarProps): React.JSX.Element {
  const activeTabLabel =
    activeTab === 'hosts'
      ? 'Host'
      : activeTab === 'keychain'
        ? 'Keychain Entry'
        : 'Snippet'

  return (
    <div className="w-60 min-w-60 bg-base-200 border-r border-base-content/5 flex flex-col h-full">
      <div className="p-4 pb-3">
        <div className="flex items-center gap-2">
          <TerminalSquare className="w-5 h-5 text-primary" />
          <h1 className="text-sm font-semibold tracking-tight">NodeLink</h1>
        </div>
      </div>

      <div className="px-3 pb-3">
        <div role="tablist" className="tabs tabs-sm tabs-boxed bg-base-300/50 p-0.5 rounded-lg">
          <button
            role="tab"
            aria-selected={activeTab === 'hosts'}
            className={`tab tab-sm rounded-md text-xs transition-all ${
              activeTab === 'hosts' ? 'tab-active bg-base-100 shadow-sm font-medium' : 'text-base-content/60'
            }`}
            onClick={() => onTabChange('hosts')}
          >
            Hosts
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'keychain'}
            className={`tab tab-sm rounded-md text-xs transition-all ${
              activeTab === 'keychain' ? 'tab-active bg-base-100 shadow-sm font-medium' : 'text-base-content/60'
            }`}
            onClick={() => onTabChange('keychain')}
          >
            Keychain
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'snippets'}
            className={`tab tab-sm rounded-md text-xs transition-all ${
              activeTab === 'snippets' ? 'tab-active bg-base-100 shadow-sm font-medium' : 'text-base-content/60'
            }`}
            onClick={() => onTabChange('snippets')}
          >
            Snippets
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-2">
        {loading ? (
          <div className="flex flex-col gap-2 p-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : activeTab === 'hosts' ? (
          <HostList
            hosts={hosts}
            selectedId={selectedId}
            connectedHostIds={connectedHostIds}
            onSelect={onSelectHost}
            onConnect={onConnectHost}
            onResume={onResumeHost}
            onDelete={onDeleteHost}
          />
        ) : activeTab === 'keychain' ? (
          <KeychainList
            keychain={keychain}
            selectedId={selectedId}
            onSelect={onSelectKeychain}
            onDelete={onDeleteKeychain}
          />
        ) : (
          <SnippetList
            snippets={snippets}
            selectedId={selectedId}
            onSelect={onSelectSnippet}
            onDelete={onDeleteSnippet}
          />
        )}
      </div>

      <div className="p-3 space-y-1.5 border-t border-base-content/5">
        <button
          className="btn btn-sm btn-block btn-ghost bg-base-300/40 hover:bg-base-300 gap-2 justify-start font-normal"
          onClick={
            activeTab === 'hosts'
              ? onAddHost
              : activeTab === 'keychain'
                ? onAddKeychain
                : onAddSnippet
          }
        >
          <Plus className="w-4 h-4 text-base-content/50" />
          <span className="text-xs">New {activeTabLabel}</span>
        </button>
        <button
          className="btn btn-sm btn-block btn-ghost gap-2 justify-start font-normal text-base-content/70"
          onClick={onOpenLocalTerminal}
        >
          <TerminalSquare className="w-4 h-4" />
          <span className="text-xs">Local Terminal</span>
        </button>
      </div>
    </div>
  )
}
