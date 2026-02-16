import { useState, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { Host, KeychainEntry, Snippet } from '@shared/types'
import type { Tab, View } from '../types'

export type TerminalSession =
  | { type: 'ssh'; sessionId: string; host: Host }
  | { type: 'local'; sessionId: string }

export function useAppNavigation() {
  const [activeTab, setActiveTab] = useState<Tab>('hosts')
  const [view, setView] = useState<View>({ type: 'empty' })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [connectedHostIds, setConnectedHostIds] = useState<Set<string>>(new Set())
  const [sessions, setSessions] = useState<TerminalSession[]>([])
  const [pendingReconnect, setPendingReconnect] = useState<string | null>(null)

  const selectHost = useCallback((host: Host): void => {
    setSelectedId(host.id)
    setView({ type: 'host-form', host })
  }, [])

  const selectKeychain = useCallback((entry: KeychainEntry): void => {
    setSelectedId(entry.id)
    setView({ type: 'keychain-form', entry })
  }, [])

  const selectSnippet = useCallback((snippet: Snippet): void => {
    setSelectedId(snippet.id)
    setView({ type: 'snippet-form', snippet })
  }, [])

  const connectHost = useCallback((host: Host): void => {
    // Always create a new session (multiple sessions per host allowed)
    const sessionId = uuidv4()
    setSessions((prev) => [...prev, { type: 'ssh', sessionId, host }])
    setSelectedId(host.id)
    setConnectedHostIds((ids) => new Set(ids).add(host.id))
    setView({ type: 'terminal', host, sessionId })
  }, [])

  const disconnectSession = useCallback((sessionId: string): void => {
    setSessions((prev) => {
      const session = prev.find((s) => s.sessionId === sessionId)
      const remaining = prev.filter((s) => s.sessionId !== sessionId)
      // Only remove from connectedHostIds if no other sessions exist for this host
      if (session && session.type === 'ssh') {
        const hasOtherSessions = remaining.some(
          (s) => s.type === 'ssh' && s.host.id === session.host.id
        )
        if (!hasOtherSessions) {
          setConnectedHostIds((ids) => {
            const next = new Set(ids)
            next.delete(session.host.id)
            return next
          })
        }
      }
      return remaining
    })
    setView({ type: 'empty' })
    setSelectedId(null)
  }, [])

  const resumeHost = useCallback((hostId: string): void => {
    // Resume the most recently created session for this host
    setSessions((prev) => {
      const hostSessions = prev.filter((s) => s.type === 'ssh' && s.host.id === hostId)
      const session = hostSessions[hostSessions.length - 1]
      if (session && session.type === 'ssh') {
        setSelectedId(hostId)
        setView({ type: 'terminal', host: session.host, sessionId: session.sessionId })
      }
      return prev
    })
  }, [])

  const switchToSession = useCallback((sessionId: string): void => {
    setSessions((prev) => {
      const session = prev.find((s) => s.sessionId === sessionId)
      if (session) {
        if (session.type === 'ssh') {
          setSelectedId(session.host.id)
          setView({ type: 'terminal', host: session.host, sessionId: session.sessionId })
        } else {
          setSelectedId(null)
          setView({ type: 'local-terminal', sessionId: session.sessionId })
        }
      }
      return prev
    })
  }, [])

  const requestReconnect = useCallback((sessionId: string): void => {
    // Switch to the session and set the reconnect signal (SSH only)
    setSessions((prev) => {
      const session = prev.find((s) => s.sessionId === sessionId)
      if (session && session.type === 'ssh') {
        setSelectedId(session.host.id)
        setView({ type: 'terminal', host: session.host, sessionId: session.sessionId })
        setPendingReconnect(sessionId)
      }
      return prev
    })
  }, [])

  const clearPendingReconnect = useCallback((): void => {
    setPendingReconnect(null)
  }, [])

  const openLocalTerminal = useCallback((): void => {
    const sessionId = uuidv4()
    setSessions((prev) => [...prev, { type: 'local', sessionId }])
    setSelectedId(null)
    setView({ type: 'local-terminal', sessionId })
  }, [])

  const addHost = useCallback((): void => {
    setSelectedId(null)
    setView({ type: 'host-form', host: null })
  }, [])

  const addKeychain = useCallback((): void => {
    setSelectedId(null)
    setView({ type: 'keychain-form', entry: null })
  }, [])

  const addSnippet = useCallback((): void => {
    setSelectedId(null)
    setView({ type: 'snippet-form', snippet: null })
  }, [])

  const resetView = useCallback((): void => {
    setView({ type: 'empty' })
    setSelectedId(null)
  }, [])

  const clearIfSelected = useCallback((id: string): void => {
    setSelectedId((current) => {
      if (current === id) {
        setView({ type: 'empty' })
        return null
      }
      return current
    })
  }, [])

  return {
    activeTab,
    setActiveTab,
    view,
    selectedId,
    connectedHostIds,
    sessions,
    pendingReconnect,
    selectHost,
    selectKeychain,
    selectSnippet,
    connectHost,
    disconnectSession,
    resumeHost,
    switchToSession,
    requestReconnect,
    clearPendingReconnect,
    openLocalTerminal,
    addHost,
    addKeychain,
    addSnippet,
    resetView,
    clearIfSelected
  }
}
