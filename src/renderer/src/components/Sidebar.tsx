import { useState } from 'react'
import * as Tooltip from '@radix-ui/react-tooltip'
import { Plus, TerminalSquare, ChevronLeft, ChevronRight, Command } from './icons'
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
  onOpenCommandPalette: () => void
}

function SidebarTooltip({ label, children }: { label: string; children: React.ReactNode }): React.JSX.Element {
  return (
    <Tooltip.Root delayDuration={300}>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side="right"
          sideOffset={8}
          className="bg-base-100 text-base-content text-xs px-2.5 py-1.5 rounded-lg shadow-lg border border-base-content/5 z-50 animate-fade-in-scale"
        >
          {label}
          <Tooltip.Arrow className="fill-base-100" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
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
  onOpenLocalTerminal,
  onOpenCommandPalette
}: SidebarProps): React.JSX.Element {
  const [collapsed, setCollapsed] = useState(false)

  const activeTabLabel =
    activeTab === 'hosts'
      ? 'Host'
      : activeTab === 'keychain'
        ? 'Keychain Entry'
        : 'Snippet'

  return (
    <Tooltip.Provider>
      <div
        className={`bg-base-200 border-r border-base-content/5 flex flex-col h-full transition-all duration-200 ${
          collapsed ? 'w-14 min-w-14' : 'w-60 min-w-60'
        }`}
      >
        {/* Header */}
        <div className="p-3 pb-2 flex items-center justify-between">
          <div className={`flex items-center gap-2 ${collapsed ? 'justify-center w-full' : ''}`}>
            <TerminalSquare className="w-5 h-5 text-primary shrink-0" />
            {!collapsed && <h1 className="text-sm font-semibold tracking-tight">NodeLink</h1>}
          </div>
          {!collapsed && (
            <button
              className="btn btn-ghost btn-xs btn-square text-base-content/40 hover:text-base-content"
              onClick={() => setCollapsed(true)}
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Collapsed expand button */}
        {collapsed && (
          <div className="px-2 pb-2 flex justify-center">
            <button
              className="btn btn-ghost btn-xs btn-square text-base-content/40 hover:text-base-content"
              onClick={() => setCollapsed(false)}
              aria-label="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tabs */}
        {!collapsed && (
          <div className="px-3 pb-3">
            <div className="flex bg-base-300/40 rounded-lg p-0.5">
              {(['hosts', 'keychain', 'snippets'] as const).map((tab) => (
                <button
                  key={tab}
                  role="tab"
                  aria-selected={activeTab === tab}
                  className={`flex-1 py-1 text-xs rounded-md transition-all ${
                    activeTab === tab
                      ? 'bg-base-100 shadow-sm font-medium text-base-content'
                      : 'text-base-content/60 hover:text-base-content/80'
                  }`}
                  onClick={() => onTabChange(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Collapsed tab icons */}
        {collapsed && (
          <div className="flex flex-col items-center gap-1 px-2 pb-2">
            {(['hosts', 'keychain', 'snippets'] as const).map((tab) => {
              const label = tab.charAt(0).toUpperCase() + tab.slice(1)
              return (
                <SidebarTooltip key={tab} label={label}>
                  <button
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold transition-colors ${
                      activeTab === tab
                        ? 'bg-primary/10 text-primary'
                        : 'text-base-content/40 hover:bg-base-content/5 hover:text-base-content/70'
                    }`}
                    onClick={() => onTabChange(tab)}
                    aria-label={label}
                  >
                    {tab.charAt(0).toUpperCase()}
                  </button>
                </SidebarTooltip>
              )
            })}
          </div>
        )}

        {/* List content */}
        {!collapsed && (
          <div className="flex-1 overflow-y-auto scrollbar-thin px-2">
            {loading ? (
              <div className="flex flex-col gap-2 p-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton h-12 w-full rounded-xl" />
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
        )}

        {/* Collapsed: just icons for action items */}
        {collapsed && <div className="flex-1" />}

        {/* Footer */}
        <div className={`p-2 space-y-1 border-t border-base-content/5 ${collapsed ? 'flex flex-col items-center' : ''}`}>
          {collapsed ? (
            <>
              <SidebarTooltip label={`New ${activeTabLabel}`}>
                <button
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-base-content/50 hover:bg-base-content/5 hover:text-base-content/70 transition-colors"
                  onClick={
                    activeTab === 'hosts'
                      ? onAddHost
                      : activeTab === 'keychain'
                        ? onAddKeychain
                        : onAddSnippet
                  }
                  aria-label={`New ${activeTabLabel}`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </SidebarTooltip>
              <SidebarTooltip label="Local Terminal">
                <button
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-base-content/50 hover:bg-base-content/5 hover:text-base-content/70 transition-colors"
                  onClick={onOpenLocalTerminal}
                  aria-label="Local Terminal"
                >
                  <TerminalSquare className="w-4 h-4" />
                </button>
              </SidebarTooltip>
              <SidebarTooltip label="Command Palette">
                <button
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-base-content/50 hover:bg-base-content/5 hover:text-base-content/70 transition-colors"
                  onClick={onOpenCommandPalette}
                  aria-label="Command Palette"
                >
                  <Command className="w-4 h-4" />
                </button>
              </SidebarTooltip>
            </>
          ) : (
            <>
              <button
                className="btn btn-sm btn-block btn-ghost bg-base-300/40 hover:bg-base-300 gap-2 justify-start font-normal rounded-lg"
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
                className="btn btn-sm btn-block btn-ghost gap-2 justify-start font-normal text-base-content/70 rounded-lg"
                onClick={onOpenLocalTerminal}
              >
                <TerminalSquare className="w-4 h-4" />
                <span className="text-xs">Local Terminal</span>
              </button>
              <button
                className="btn btn-sm btn-block btn-ghost gap-2 justify-between font-normal text-base-content/50 rounded-lg"
                onClick={onOpenCommandPalette}
              >
                <span className="flex items-center gap-2">
                  <Command className="w-4 h-4" />
                  <span className="text-xs">Command Palette</span>
                </span>
                <kbd className="kbd kbd-xs text-base-content/30">⌘K</kbd>
              </button>
            </>
          )}
        </div>
      </div>
    </Tooltip.Provider>
  )
}
