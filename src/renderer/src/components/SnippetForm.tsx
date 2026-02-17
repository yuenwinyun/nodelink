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
    <div className="max-w-md mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-base font-semibold text-base-content">
          {snippet ? 'Edit Snippet' : 'New Snippet'}
        </h2>
        <p className="text-xs text-base-content/50 mt-0.5">
          {snippet ? 'Update snippet details' : 'Save a reusable command snippet'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-base-200/50 rounded-xl border border-base-content/5 p-4 space-y-4">
          <h3 className="text-[10px] font-semibold uppercase tracking-widest text-base-content/40">
            Details
          </h3>
          <fieldset className="fieldset">
            <label className="fieldset-label text-xs font-medium text-base-content/70" htmlFor="snippet-name">
              Name
            </label>
            <input
              id="snippet-name"
              type="text"
              className={`input input-bordered input-sm w-full bg-base-300/20 focus:border-primary/30 rounded-lg transition-colors placeholder:text-base-content/30 ${errors.name ? 'input-error' : ''}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="List containers"
            />
            {errors.name && <p className="text-error text-xs mt-1">{errors.name}</p>}
          </fieldset>

          <fieldset className="fieldset">
            <label className="fieldset-label text-xs font-medium text-base-content/70" htmlFor="snippet-command">
              Command
            </label>
            <textarea
              id="snippet-command"
              className={`textarea textarea-bordered w-full font-mono text-sm bg-base-300/20 focus:border-primary/30 rounded-lg transition-colors ${errors.command ? 'textarea-error' : ''}`}
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="docker ps -a"
              rows={4}
            />
            {errors.command && <p className="text-error text-xs mt-1">{errors.command}</p>}
          </fieldset>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn btn-ghost btn-sm rounded-lg" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-sm rounded-lg">
            {snippet ? 'Save' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  )
}
