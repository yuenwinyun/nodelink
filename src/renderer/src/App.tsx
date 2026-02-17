import type { Host, KeychainEntry, Snippet } from '@shared/types'
import { useHosts } from './hooks/useHosts'
import { useKeychain } from './hooks/useKeychain'
import { useSnippets } from './hooks/useSnippets'
import { useAppNavigation } from './hooks/useAppNavigation'
import { useCommandPalette } from './hooks/useCommandPalette'
import { Sidebar } from './components/Sidebar'
import { SessionTabs } from './components/SessionTabs'
import { HostForm } from './components/HostForm'
import { KeychainForm } from './components/KeychainForm'
import { SnippetForm } from './components/SnippetForm'
import { EmptyState } from './components/EmptyState'
import { TerminalView } from './components/Terminal'
import { LocalTerminalView } from './components/LocalTerminal'
import { CommandPalette } from './components/CommandPalette'

function App(): React.JSX.Element {
  const nav = useAppNavigation()
  const {
    hosts,
    loading: hostsLoading,
    create: createHost,
    update: updateHost,
    remove: removeHost,
    refresh: refreshHosts
  } = useHosts()
  const {
    keychain,
    loading: keychainLoading,
    create: createKeychainEntry,
    update: updateKeychainEntry,
    remove: removeKeychainEntry
  } = useKeychain()
  const {
    snippets,
    loading: snippetsLoading,
    create: createSnippet,
    update: updateSnippet,
    remove: removeSnippet
  } = useSnippets()
  const cmdPalette = useCommandPalette()

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

  const handleSaveSnippet = async (
    input: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<void> => {
    if (nav.view.type === 'snippet-form' && nav.view.snippet) {
      await updateSnippet(nav.view.snippet.id, input)
    } else {
      await createSnippet(input)
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

  const handleDeleteSnippet = async (id: string): Promise<void> => {
    await removeSnippet(id)
    nav.clearIfSelected(id)
  }

  const isTerminalView = nav.view.type === 'terminal' || nav.view.type === 'local-terminal'
  const activeSessionId =
    nav.view.type === 'terminal' || nav.view.type === 'local-terminal'
      ? nav.view.sessionId
      : null

  return (
    <div data-theme="dark" className="flex h-screen bg-base-300 text-base-content">
      <Sidebar
        activeTab={nav.activeTab}
        onTabChange={nav.setActiveTab}
        hosts={hosts}
        keychain={keychain}
        snippets={snippets}
        loading={hostsLoading || keychainLoading || snippetsLoading}
        selectedId={nav.selectedId}
        connectedHostIds={nav.connectedHostIds}
        onSelectHost={nav.selectHost}
        onSelectKeychain={nav.selectKeychain}
        onSelectSnippet={nav.selectSnippet}
        onConnectHost={nav.connectHost}
        onResumeHost={nav.resumeHost}
        onAddHost={nav.addHost}
        onAddKeychain={nav.addKeychain}
        onAddSnippet={nav.addSnippet}
        onDeleteHost={handleDeleteHost}
        onDeleteKeychain={handleDeleteKeychain}
        onDeleteSnippet={handleDeleteSnippet}
        onOpenLocalTerminal={nav.openLocalTerminal}
        onOpenCommandPalette={cmdPalette.toggle}
      />

      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Session tabs bar -- always visible when sessions exist */}
        <SessionTabs
          sessions={nav.sessions}
          activeSessionId={activeSessionId}
          onSwitch={nav.switchToSession}
          onDisconnect={nav.disconnectSession}
        />

        {/* Non-terminal views: shown only when no terminal is active */}
        {!isTerminalView && (
          <>
            {nav.view.type === 'empty' && (
              <EmptyState
                title="Welcome to NodeLink"
                description="Select a host or keychain entry from the sidebar, or create a new one to get started. Double-click a host to connect."
                action={{
                  label:
                    nav.activeTab === 'hosts'
                      ? 'Add Host'
                      : nav.activeTab === 'keychain'
                        ? 'Add Keychain Entry'
                        : 'Add Snippet',
                  onClick:
                    nav.activeTab === 'hosts'
                      ? nav.addHost
                      : nav.activeTab === 'keychain'
                        ? nav.addKeychain
                        : nav.addSnippet
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

            {nav.view.type === 'snippet-form' && (
              <SnippetForm
                snippet={nav.view.snippet}
                onSave={handleSaveSnippet}
                onCancel={nav.resetView}
              />
            )}
          </>
        )}

        {/* Terminal sessions: always rendered, shown/hidden via CSS */}
        {nav.sessions.map((s) => (
          <div
            key={s.sessionId}
            className={
              activeSessionId === s.sessionId
                ? 'flex-1 flex flex-col'
                : 'hidden'
            }
          >
            {s.type === 'ssh' ? (
              <TerminalView
                host={s.host}
                keychain={keychain}
                snippets={snippets}
                sessionId={s.sessionId}
                visible={activeSessionId === s.sessionId}
                pendingReconnect={nav.pendingReconnect === s.sessionId}
                onReconnectHandled={nav.clearPendingReconnect}
                onDisconnect={() => nav.disconnectSession(s.sessionId)}
                onUpdateHost={updateHost}
              />
            ) : (
              <LocalTerminalView
                sessionId={s.sessionId}
                snippets={snippets}
                visible={activeSessionId === s.sessionId}
                onClose={() => nav.disconnectSession(s.sessionId)}
              />
            )}
          </div>
        ))}
      </main>

      {/* Command Palette */}
      <CommandPalette
        open={cmdPalette.open}
        onOpenChange={cmdPalette.setOpen}
        hosts={hosts}
        keychain={keychain}
        snippets={snippets}
        onConnectHost={nav.connectHost}
        onSelectKeychain={nav.selectKeychain}
        onSelectSnippet={nav.selectSnippet}
        onAddHost={nav.addHost}
        onAddKeychain={nav.addKeychain}
        onAddSnippet={nav.addSnippet}
        onOpenLocalTerminal={nav.openLocalTerminal}
      />
    </div>
  )
}

export default App
