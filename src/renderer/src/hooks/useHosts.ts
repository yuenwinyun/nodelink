import { useState, useEffect, useCallback } from 'react'
import type { Host } from '@shared/types'

export function useHosts() {
  const [hosts, setHosts] = useState<Host[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const data = await window.api.getHosts()
    setHosts(data.sort((a, b) => a.name.localeCompare(b.name)))
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const create = async (input: Omit<Host, 'id' | 'createdAt' | 'updatedAt'>) => {
    const host = await window.api.createHost(input)
    await refresh()
    return host
  }

  const update = async (
    id: string,
    input: Partial<Omit<Host, 'id' | 'createdAt' | 'updatedAt'>>
  ) => {
    const host = await window.api.updateHost(id, input)
    await refresh()
    return host
  }

  const remove = async (id: string) => {
    await window.api.deleteHost(id)
    await refresh()
  }

  return { hosts, loading, create, update, remove, refresh }
}
