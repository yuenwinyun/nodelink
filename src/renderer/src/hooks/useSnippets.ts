import { useState, useEffect, useCallback } from 'react'
import type { Snippet } from '@shared/types'

export function useSnippets() {
  const [snippets, setSnippets] = useState<Snippet[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const data = await window.api.getSnippets()
    setSnippets(data.sort((a, b) => a.name.localeCompare(b.name)))
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const create = async (input: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) => {
    const snippet = await window.api.createSnippet(input)
    await refresh()
    return snippet
  }

  const update = async (
    id: string,
    input: Partial<Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>>
  ) => {
    const snippet = await window.api.updateSnippet(id, input)
    await refresh()
    return snippet
  }

  const remove = async (id: string) => {
    await window.api.deleteSnippet(id)
    await refresh()
  }

  return { snippets, loading, create, update, remove, refresh }
}
