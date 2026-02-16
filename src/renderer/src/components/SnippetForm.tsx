import { useState, useEffect } from 'react'
import type { Snippet } from '@shared/types'

interface SnippetFormProps {
  snippet: Snippet | null // null = create mode
  onSave: (input: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

export function SnippetForm({
  snippet,
  onSave,
  onCancel
}: SnippetFormProps): React.JSX.Element {
  const [name, setName] = useState('')
  const [command, setCommand] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (snippet) {
      setName(snippet.name)
      setCommand(snippet.command)
    }
  }, [snippet])

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Name is required'
    if (!command.trim()) errs.command = 'Command is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    if (!validate()) return
    onSave({
      name: name.trim(),
      command: command.trim()
    })
  }

  return (
    <div className="max-w-lg mx-auto p-6">
      <h2 className="text-xl font-bold mb-6">{snippet ? 'Edit Snippet' : 'New Snippet'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <fieldset className="fieldset">
          <label className="fieldset-label" htmlFor="snippet-name">
            Name
          </label>
          <input
            id="snippet-name"
            type="text"
            className={`input input-bordered w-full ${errors.name ? 'input-error' : ''}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="List containers"
          />
          {errors.name && <p className="text-error text-xs mt-1">{errors.name}</p>}
        </fieldset>

        <fieldset className="fieldset">
          <label className="fieldset-label" htmlFor="snippet-command">
            Command
          </label>
          <textarea
            id="snippet-command"
            className={`textarea textarea-bordered w-full font-mono text-sm ${errors.command ? 'textarea-error' : ''}`}
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="docker ps -a"
            rows={4}
          />
          {errors.command && <p className="text-error text-xs mt-1">{errors.command}</p>}
        </fieldset>

        <div className="flex gap-2 pt-2">
          <button type="submit" className="btn btn-primary">
            {snippet ? 'Save' : 'Create'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
