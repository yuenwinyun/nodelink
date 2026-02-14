import type { Host, KeychainEntry } from '@shared/types'
import { useHosts } from './hooks/useHosts'
import { useKeychain } from './hooks/useKeychain'
import { useAppNavigation } from './hooks/useAppNavigation'
import { Sidebar } from './components/Sidebar'
import { HostForm } from './components/HostForm'
import { KeychainForm } from './components/KeychainForm'
import { EmptyState } from './components/EmptyState'
import { TerminalView } from './components/Terminal'

function App(): React.JSX.Element {
  const nav = useAppNavigation()
  const { hosts, loading: hostsLoading, create: createHost, update: updateHost, remove: removeHost, refresh: refreshHosts } = useHosts()
  const {
    keychain,
    loading: keychainLoading,
    create: createKeychainEntry,
    update: updateKeychainEntry,
    remove: removeKeychainEntry
  } = useKeychain()

  const handleSaveHost = async (
    input: Omit<Host, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<void> => {
    if (nav.view.type === 'host-form' && nav.view.host) {
      await updateHost(nav.view.host.id, input)
    } else {
      await createHost(input)
    }
    nav.resetView()
  }

  const handleSaveKeychain = async (
    input: Omit<KeychainEntry, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<void> => {
    if (nav.view.type === 'keychain-form' && nav.view.entry) {
      await updateKeychainEntry(nav.view.entry.id, input)
    } else {
      await createKeychainEntry(input)
    }
    nav.resetView()
  }

  const handleDeleteHost = async (id: string): Promise<void> => {
    await removeHost(id)
    nav.clearIfSelected(id)
  }

  const handleDeleteKeychain = async (id: string): Promise<void> => {
    await removeKeychainEntry(id)
    await refreshHosts()
    nav.clearIfSelected(id)
  }

  return (
    <div className="flex h-screen bg-base-300 text-base-content">
      <Sidebar
        activeTab={nav.activeTab}
        onTabChange={nav.setActiveTab}
        hosts={hosts}
        keychain={keychain}
        loading={hostsLoading || keychainLoading}
        selectedId={nav.selectedId}
        connectedHostIds={nav.connectedHostIds}
        onSelectHost={nav.selectHost}
        onSelectKeychain={nav.selectKeychain}
        onConnectHost={nav.connectHost}
        onAddHost={nav.addHost}
        onAddKeychain={nav.addKeychain}
        onDeleteHost={handleDeleteHost}
        onDeleteKeychain={handleDeleteKeychain}
      />

      <main className="flex-1 overflow-hidden">
        {nav.view.type === 'empty' && (
          <EmptyState
            title="Welcome to NodeLink"
            description="Select a host or keychain entry from the sidebar, or create a new one to get started. Double-click a host to connect."
            action={{
              label: nav.activeTab === 'hosts' ? 'Add Host' : 'Add Keychain Entry',
              onClick: nav.activeTab === 'hosts' ? nav.addHost : nav.addKeychain
            }}
          />
        )}

        {nav.view.type === 'host-form' && (
          <HostForm
            host={nav.view.host}
            keychain={keychain}
            onSave={handleSaveHost}
            onCancel={nav.resetView}
          />
        )}

        {nav.view.type === 'keychain-form' && (
          <KeychainForm
            entry={nav.view.entry}
            onSave={handleSaveKeychain}
            onCancel={nav.resetView}
          />
        )}

        {nav.view.type === 'terminal' && (
          <TerminalView
            host={nav.view.host}
            keychain={keychain}
            sessionId={nav.view.sessionId}
            onDisconnect={nav.disconnect}
          />
        )}
      </main>
    </div>
  )
}

export default App
