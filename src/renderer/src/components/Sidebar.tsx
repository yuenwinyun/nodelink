import type { Host, KeychainEntry } from '@shared/types'
import type { Tab } from '../types'
import { HostList } from './HostList'
import { KeychainList } from './KeychainList'

interface SidebarProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  hosts: Host[]
  keychain: KeychainEntry[]
  loading: boolean
  selectedId: string | null
  connectedHostIds: Set<string>
  onSelectHost: (host: Host) => void
  onSelectKeychain: (entry: KeychainEntry) => void
  onConnectHost: (host: Host) => void
  onAddHost: () => void
  onAddKeychain: () => void
  onDeleteHost: (id: string) => void
  onDeleteKeychain: (id: string) => void
}

export function Sidebar({
  activeTab,
  onTabChange,
  hosts,
  keychain,
  loading,
  selectedId,
  connectedHostIds,
  onSelectHost,
  onSelectKeychain,
  onConnectHost,
  onAddHost,
  onAddKeychain,
  onDeleteHost,
  onDeleteKeychain
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
            onDelete={onDeleteHost}
          />
        ) : (
          <KeychainList
            keychain={keychain}
            selectedId={selectedId}
            onSelect={onSelectKeychain}
            onDelete={onDeleteKeychain}
          />
        )}
      </div>

      <div className="p-3 border-t border-base-300">
        <button
          className="btn btn-primary btn-sm w-full"
          onClick={activeTab === 'hosts' ? onAddHost : onAddKeychain}
        >
          + Add {activeTab === 'hosts' ? 'Host' : 'Keychain Entry'}
        </button>
      </div>
    </div>
  )
}
