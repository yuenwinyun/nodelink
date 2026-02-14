import { useState, useEffect } from 'react'
import type { Host, KeychainEntry } from '@shared/types'

interface HostFormProps {
  host: Host | null // null = create mode
  keychain: KeychainEntry[]
  onSave: (input: Omit<Host, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

export function HostForm({ host, keychain, onSave, onCancel }: HostFormProps): React.JSX.Element {
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [port, setPort] = useState(22)
  const [username, setUsername] = useState('')
  const [keychainId, setKeychainId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (host) {
      setName(host.name)
      setAddress(host.address)
      setPort(host.port)
      setUsername(host.username)
      setKeychainId(host.keychainId)
    }
  }, [host])

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Name is required'
    if (!address.trim()) errs.address = 'Address is required'
    if (!username.trim()) errs.username = 'Username is required'
    if (port < 1 || port > 65535) errs.port = 'Port must be 1-65535'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    if (!validate()) return
    onSave({ name: name.trim(), address: address.trim(), port, username: username.trim(), keychainId })
  }

  return (
    <div className="max-w-lg mx-auto p-6">
      <h2 className="text-xl font-bold mb-6">{host ? 'Edit Host' : 'New Host'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <fieldset className="fieldset">
          <label className="fieldset-label" htmlFor="host-name">Name</label>
          <input
            id="host-name"
            type="text"
            className={`input input-bordered w-full ${errors.name ? 'input-error' : ''}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Server"
          />
          {errors.name && <p className="text-error text-xs mt-1">{errors.name}</p>}
        </fieldset>

        <fieldset className="fieldset">
          <label className="fieldset-label" htmlFor="host-address">Address</label>
          <input
            id="host-address"
            type="text"
            className={`input input-bordered w-full ${errors.address ? 'input-error' : ''}`}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="192.168.1.100 or example.com"
          />
          {errors.address && <p className="text-error text-xs mt-1">{errors.address}</p>}
        </fieldset>

        <fieldset className="fieldset">
          <label className="fieldset-label" htmlFor="host-port">Port</label>
          <input
            id="host-port"
            type="number"
            className={`input input-bordered w-full ${errors.port ? 'input-error' : ''}`}
            value={port}
            onChange={(e) => setPort(Number(e.target.value))}
            min={1}
            max={65535}
          />
          {errors.port && <p className="text-error text-xs mt-1">{errors.port}</p>}
        </fieldset>

        <fieldset className="fieldset">
          <label className="fieldset-label" htmlFor="host-username">Username</label>
          <input
            id="host-username"
            type="text"
            className={`input input-bordered w-full ${errors.username ? 'input-error' : ''}`}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="root"
          />
          {errors.username && <p className="text-error text-xs mt-1">{errors.username}</p>}
        </fieldset>

        <fieldset className="fieldset">
          <label className="fieldset-label" htmlFor="host-keychain">Keychain</label>
          <select
            id="host-keychain"
            className="select select-bordered w-full"
            value={keychainId ?? ''}
            onChange={(e) => setKeychainId(e.target.value || null)}
          >
            <option value="">None</option>
            {keychain.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.label} ({entry.username})
              </option>
            ))}
          </select>
        </fieldset>

        <div className="flex gap-2 pt-2">
          <button type="submit" className="btn btn-primary">
            {host ? 'Save' : 'Create'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
