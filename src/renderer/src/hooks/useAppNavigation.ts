import { useState, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { Host, KeychainEntry } from '@shared/types'
import type { Tab, View } from '../types'

export function useAppNavigation() {
  const [activeTab, setActiveTab] = useState<Tab>('hosts')
  const [view, setView] = useState<View>({ type: 'empty' })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [connectedHostIds, setConnectedHostIds] = useState<Set<string>>(new Set())

  const selectHost = useCallback((host: Host): void => {
    setSelectedId(host.id)
    setView({ type: 'host-form', host })
  }, [])

  const selectKeychain = useCallback((entry: KeychainEntry): void => {
    setSelectedId(entry.id)
    setView({ type: 'keychain-form', entry })
  }, [])

  const connectHost = useCallback((host: Host): void => {
    const sessionId = uuidv4()
    setSelectedId(host.id)
    setConnectedHostIds((prev) => new Set(prev).add(host.id))
    setView({ type: 'terminal', host, sessionId })
  }, [])

  const disconnect = useCallback((): void => {
    setView((prev) => {
      if (prev.type === 'terminal') {
        setConnectedHostIds((ids) => {
          const next = new Set(ids)
          next.delete(prev.host.id)
          return next
        })
      }
      return { type: 'empty' }
    })
    setSelectedId(null)
  }, [])

  const addHost = useCallback((): void => {
    setSelectedId(null)
    setView({ type: 'host-form', host: null })
  }, [])

  const addKeychain = useCallback((): void => {
    setSelectedId(null)
    setView({ type: 'keychain-form', entry: null })
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
    selectHost,
    selectKeychain,
    connectHost,
    disconnect,
    addHost,
    addKeychain,
    resetView,
    clearIfSelected
  }
}
