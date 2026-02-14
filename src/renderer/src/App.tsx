import { useState, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { Host, KeychainEntry } from '@shared/types'
import { useHosts } from './hooks/useHosts'
import { useKeychain } from './hooks/useKeychain'
import { Sidebar } from './components/Sidebar'
import { HostForm } from './components/HostForm'
import { KeychainForm } from './components/KeychainForm'
import { EmptyState } from './components/EmptyState'
import { TerminalView } from './components/Terminal'

type Tab = 'hosts' | 'keychain'
type View =
  | { type: 'empty' }
  | { type: 'host-form'; host: Host | null }
  | { type: 'keychain-form'; entry: KeychainEntry | null }
  | { type: 'terminal'; host: Host; sessionId: string }

function App(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<Tab>('hosts')
  const [view, setView] = useState<View>({ type: 'empty' })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [connectedHostIds, setConnectedHostIds] = useState<Set<string>>(new Set())

  const { hosts, create: createHost, update: updateHost, remove: removeHost, refresh: refreshHosts } = useHosts()
  const {
    keychain,
    create: createKeychainEntry,
    update: updateKeychainEntry,
    remove: removeKeychainEntry
  } = useKeychain()

  const handleSelectHost = (host: Host): void => {
    setSelectedId(host.id)
    setView({ type: 'host-form', host })
  }

  const handleSelectKeychain = (entry: KeychainEntry): void => {
    setSelectedId(entry.id)
    setView({ type: 'keychain-form', entry })
  }

  const handleConnectHost = useCallback((host: Host): void => {
    const sessionId = uuidv4()
    setSelectedId(host.id)
    setConnectedHostIds((prev) => new Set(prev).add(host.id))
    setView({ type: 'terminal', host, sessionId })
  }, [])

  const handleDisconnect = useCallback((): void => {
    if (view.type === 'terminal') {
      setConnectedHostIds((prev) => {
        const next = new Set(prev)
        next.delete(view.host.id)
        return next
      })
    }
    setView({ type: 'empty' })
    setSelectedId(null)
  }, [view])

  const handleAddHost = (): void => {
    setSelectedId(null)
    setView({ type: 'host-form', host: null })
  }

  const handleAddKeychain = (): void => {
    setSelectedId(null)
    setView({ type: 'keychain-form', entry: null })
  }

  const handleSaveHost = async (
    input: Omit<Host, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<void> => {
    if (view.type === 'host-form' && view.host) {
      await updateHost(view.host.id, input)
    } else {
      await createHost(input)
    }
    setView({ type: 'empty' })
    setSelectedId(null)
  }

  const handleSaveKeychain = async (
    input: Omit<KeychainEntry, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<void> => {
    if (view.type === 'keychain-form' && view.entry) {
      await updateKeychainEntry(view.entry.id, input)
    } else {
      await createKeychainEntry(input)
    }
    setView({ type: 'empty' })
    setSelectedId(null)
  }

  const handleDeleteHost = async (id: string): Promise<void> => {
    await removeHost(id)
    if (selectedId === id) {
      setView({ type: 'empty' })
      setSelectedId(null)
    }
  }

  const handleDeleteKeychain = async (id: string): Promise<void> => {
    await removeKeychainEntry(id)
    await refreshHosts()
    if (selectedId === id) {
      setView({ type: 'empty' })
      setSelectedId(null)
    }
  }

  const handleCancel = (): void => {
    setView({ type: 'empty' })
    setSelectedId(null)
  }

  return (
    <div className="flex h-screen bg-base-300 text-base-content">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hosts={hosts}
        keychain={keychain}
        selectedId={selectedId}
        connectedHostIds={connectedHostIds}
        onSelectHost={handleSelectHost}
        onSelectKeychain={handleSelectKeychain}
        onConnectHost={handleConnectHost}
        onAddHost={handleAddHost}
        onAddKeychain={handleAddKeychain}
        onDeleteHost={handleDeleteHost}
        onDeleteKeychain={handleDeleteKeychain}
      />

      <main className="flex-1 overflow-hidden">
        {view.type === 'empty' && (
          <EmptyState
            title="Welcome to Termius Mock"
            description="Select a host or keychain entry from the sidebar, or create a new one to get started. Double-click a host to connect."
            action={{
              label: activeTab === 'hosts' ? 'Add Host' : 'Add Keychain Entry',
              onClick: activeTab === 'hosts' ? handleAddHost : handleAddKeychain
            }}
          />
        )}

        {view.type === 'host-form' && (
          <HostForm
            host={view.host}
            keychain={keychain}
            onSave={handleSaveHost}
            onCancel={handleCancel}
          />
        )}

        {view.type === 'keychain-form' && (
          <KeychainForm
            entry={view.entry}
            onSave={handleSaveKeychain}
            onCancel={handleCancel}
          />
        )}

        {view.type === 'terminal' && (
          <TerminalView
            host={view.host}
            keychain={keychain}
            sessionId={view.sessionId}
            onDisconnect={handleDisconnect}
          />
        )}
      </main>
    </div>
  )
}

export default App
