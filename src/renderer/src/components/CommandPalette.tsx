import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { SearchInput } from './SearchInput'
import { Globe, Key, Zap, TerminalSquare } from './icons'
import type { Host, KeychainEntry, Snippet } from '@shared/types'

type ResultItem =
  | { type: 'host'; host: Host }
  | { type: 'keychain'; entry: KeychainEntry }
  | { type: 'snippet'; snippet: Snippet }
  | { type: 'action'; id: string; label: string; description: string }

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  hosts: Host[]
  keychain: KeychainEntry[]
  snippets: Snippet[]
  onConnectHost: (host: Host) => void
  onSelectKeychain: (entry: KeychainEntry) => void
  onSelectSnippet: (snippet: Snippet) => void
  onAddHost: () => void
  onAddKeychain: () => void
  onAddSnippet: () => void
  onOpenLocalTerminal: () => void
}

export function CommandPalette({
  open,
  onOpenChange,
  hosts,
  keychain,
  snippets,
  onConnectHost,
  onSelectKeychain,
  onSelectSnippet,
  onAddHost,
  onAddKeychain,
  onAddSnippet,
  onOpenLocalTerminal
}: CommandPaletteProps): React.JSX.Element {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  type ActionItem = Extract<ResultItem, { type: 'action' }>

  const actions: ActionItem[] = useMemo(
    () => [
      { type: 'action', id: 'new-host', label: 'New Host', description: 'Create a new SSH connection' },
      { type: 'action', id: 'new-keychain', label: 'New Keychain Entry', description: 'Store new credentials' },
      { type: 'action', id: 'new-snippet', label: 'New Snippet', description: 'Save a reusable command' },
      { type: 'action', id: 'local-terminal', label: 'Open Local Terminal', description: 'Start a local shell session' }
    ],
    []
  )

  const results = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) {
      const items: ResultItem[] = []
      hosts.slice(0, 5).forEach((h) => items.push({ type: 'host', host: h }))
      keychain.slice(0, 3).forEach((e) => items.push({ type: 'keychain', entry: e }))
      snippets.slice(0, 3).forEach((s) => items.push({ type: 'snippet', snippet: s }))
      items.push(...actions)
      return items
    }
    const items: ResultItem[] = []
    hosts
      .filter((h) => h.name.toLowerCase().includes(q) || h.address.toLowerCase().includes(q))
      .forEach((h) => items.push({ type: 'host', host: h }))
    keychain
      .filter((e) => e.label.toLowerCase().includes(q) || e.username.toLowerCase().includes(q))
      .forEach((e) => items.push({ type: 'keychain', entry: e }))
    snippets
      .filter((s) => s.name.toLowerCase().includes(q) || s.command.toLowerCase().includes(q))
      .forEach((s) => items.push({ type: 'snippet', snippet: s }))
    actions
      .filter((a) => a.label.toLowerCase().includes(q))
      .forEach((a) => items.push(a))
    return items
  }, [query, hosts, keychain, snippets, actions])

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
    }
  }, [open])

  // Scroll active item into view
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const active = list.children[activeIndex] as HTMLElement | undefined
    active?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  const executeItem = useCallback(
    (item: ResultItem) => {
      onOpenChange(false)
      switch (item.type) {
        case 'host':
          onConnectHost(item.host)
          break
        case 'keychain':
          onSelectKeychain(item.entry)
          break
        case 'snippet':
          onSelectSnippet(item.snippet)
          break
        case 'action':
          if (item.id === 'new-host') onAddHost()
          else if (item.id === 'new-keychain') onAddKeychain()
          else if (item.id === 'new-snippet') onAddSnippet()
          else if (item.id === 'local-terminal') onOpenLocalTerminal()
          break
      }
    },
    [onOpenChange, onConnectHost, onSelectKeychain, onSelectSnippet, onAddHost, onAddKeychain, onAddSnippet, onOpenLocalTerminal]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((i) => (i + 1) % results.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((i) => (i - 1 + results.length) % results.length)
      } else if (e.key === 'Enter' && results.length > 0) {
        e.preventDefault()
        executeItem(results[activeIndex])
      }
    },
    [results, activeIndex, executeItem]
  )

  const getIcon = (item: ResultItem): React.JSX.Element => {
    switch (item.type) {
      case 'host':
        return <Globe className="w-4 h-4 text-primary/70" />
      case 'keychain':
        return <Key className="w-4 h-4 text-secondary/70" />
      case 'snippet':
        return <Zap className="w-4 h-4 text-accent/70" />
      case 'action':
        return <TerminalSquare className="w-4 h-4 text-base-content/40" />
    }
  }

  const getLabel = (item: ResultItem): string => {
    switch (item.type) {
      case 'host':
        return item.host.name
      case 'keychain':
        return item.entry.label
      case 'snippet':
        return item.snippet.name
      case 'action':
        return item.label
    }
  }

  const getDescription = (item: ResultItem): string => {
    switch (item.type) {
      case 'host':
        return `${item.host.username}@${item.host.address}`
      case 'keychain':
        return `${item.entry.username} - ${item.entry.authType === 'key' ? 'SSH Key' : 'Password'}`
      case 'snippet':
        return item.snippet.command
      case 'action':
        return item.description
    }
  }

  const getGroupLabel = (item: ResultItem): string => {
    switch (item.type) {
      case 'host':
        return 'Hosts'
      case 'keychain':
        return 'Keychain'
      case 'snippet':
        return 'Snippets'
      case 'action':
        return 'Actions'
    }
  }

  // Group headers
  const groupHeaders = new Set<number>()
  let lastGroup = ''
  results.forEach((item, i) => {
    const group = getGroupLabel(item)
    if (group !== lastGroup) {
      groupHeaders.add(i)
      lastGroup = group
    }
  })

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 glass-surface z-50" />
        <Dialog.Content
          className="fixed left-1/2 top-[20%] -translate-x-1/2 z-50 w-full max-w-lg rounded-xl bg-base-200/95 glass-surface shadow-2xl shadow-black/40 border border-base-content/5 focus:outline-none animate-fade-in-scale overflow-hidden"
          onKeyDown={handleKeyDown}
        >
          <Dialog.Title className="sr-only">Command Palette</Dialog.Title>
          <div className="p-3 border-b border-base-content/5">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search hosts, keychain, snippets, or actions..."
              autoFocus
            />
          </div>

          <div ref={listRef} className="max-h-80 overflow-y-auto scrollbar-thin py-1">
            {results.length === 0 ? (
              <div className="text-center text-base-content/40 py-8 text-sm">
                No results found
              </div>
            ) : (
              results.map((item, i) => (
                <div key={`${item.type}-${i}`}>
                  {groupHeaders.has(i) && (
                    <div className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-base-content/30">
                      {getGroupLabel(item)}
                    </div>
                  )}
                  <button
                    className={`flex items-center gap-3 w-full px-3 py-2 text-left transition-colors ${
                      i === activeIndex ? 'bg-primary/10 text-primary' : 'hover:bg-base-content/5'
                    }`}
                    onClick={() => executeItem(item)}
                    onMouseEnter={() => setActiveIndex(i)}
                  >
                    {getIcon(item)}
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-medium truncate">{getLabel(item)}</span>
                      <span className="text-[11px] text-base-content/40 truncate">{getDescription(item)}</span>
                    </div>
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="flex items-center justify-between px-3 py-2 border-t border-base-content/5 text-[10px] text-base-content/30">
            <span>Navigate with <kbd className="kbd kbd-xs">↑↓</kbd> Select with <kbd className="kbd kbd-xs">↵</kbd></span>
            <span><kbd className="kbd kbd-xs">esc</kbd> to close</span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
