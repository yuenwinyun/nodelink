import { useState, useEffect, useCallback } from 'react'
import type { KeychainEntry } from '@shared/types'

export function useKeychain() {
  const [keychain, setKeychain] = useState<KeychainEntry[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const data = await window.api.getKeychain()
    setKeychain(data.sort((a, b) => a.label.localeCompare(b.label)))
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const create = async (input: Omit<KeychainEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const entry = await window.api.createKeychainEntry(input)
    await refresh()
    return entry
  }

  const update = async (
    id: string,
    input: Partial<Omit<KeychainEntry, 'id' | 'createdAt' | 'updatedAt'>>
  ) => {
    const entry = await window.api.updateKeychainEntry(id, input)
    await refresh()
    return entry
  }

  const remove = async (id: string) => {
    await window.api.deleteKeychainEntry(id)
    await refresh()
  }

  return { keychain, loading, create, update, remove, refresh }
}
