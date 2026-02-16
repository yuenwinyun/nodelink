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
  return (
    <div className="w-[280px] min-w-[280px] bg-base-200 border-r border-base-300 flex flex-col h-full">
      <div className="p-4 pb-2">
        <h1 className="text-lg font-bold tracking-tight">NodeLink</h1>
      </div>

      <div role="tablist" className="tabs tabs-bordered mx-4">
        <button
          role="tab"
          className={`tab ${activeTab === 'hosts' ? 'tab-active' : ''}`}
          onClick={() => onTabChange('hosts')}
        >
          Hosts
        </button>
        <button
          role="tab"
          className={`tab ${activeTab === 'keychain' ? 'tab-active' : ''}`}
          onClick={() => onTabChange('keychain')}
        >
          Keychain
        </button>
        <button
          role="tab"
          className={`tab ${activeTab === 'snippets' ? 'tab-active' : ''}`}
          onClick={() => onTabChange('snippets')}
        >
          Snippets
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="flex flex-col gap-2 p-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-12 w-full rounded-btn" />
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

      <div className="p-3 border-t border-base-300 flex flex-col gap-2">
        <button
          className="btn btn-primary btn-sm w-full"
          onClick={
            activeTab === 'hosts'
              ? onAddHost
              : activeTab === 'keychain'
                ? onAddKeychain
                : onAddSnippet
          }
        >
          + Add{' '}
          {activeTab === 'hosts'
            ? 'Host'
            : activeTab === 'keychain'
              ? 'Keychain Entry'
              : 'Snippet'}
        </button>
        <button
          className="btn btn-ghost btn-sm w-full"
          onClick={onOpenLocalTerminal}
        >
          Local Terminal
        </button>
      </div>
    </div>
  )
}
