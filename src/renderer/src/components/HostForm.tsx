import { useState, useEffect } from 'react'
import type { Host, KeychainEntry } from '@shared/types'

interface HostFormProps {
  host: Host | null // null = create mode
  keychain: KeychainEntry[]
  onSave: (input: Omit<Host, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

export function HostForm({
  host,
  keychain,
  onSave,
  onCancel
}: HostFormProps): React.JSX.Element {
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
    onSave({
      name: name.trim(),
      address: address.trim(),
      port,
      username: username.trim(),
      keychainId,
      tunnels: host?.tunnels ?? []
    })
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-base font-semibold text-base-content">
          {host ? 'Edit Host' : 'New Host'}
        </h2>
        <p className="text-xs text-base-content/50 mt-0.5">
          {host ? 'Update connection details' : 'Configure a new SSH connection'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* General section */}
        <div className="bg-base-200/50 rounded-xl border border-base-content/5 p-4 space-y-4">
          <h3 className="text-[10px] font-semibold uppercase tracking-widest text-base-content/40">
            General
          </h3>
          <fieldset className="fieldset">
            <label className="fieldset-label text-xs font-medium text-base-content/70" htmlFor="host-name">
              Name
            </label>
            <input
              id="host-name"
              type="text"
              className={`input input-bordered input-sm w-full bg-base-300/20 focus:border-primary/30 rounded-lg transition-colors placeholder:text-base-content/30 ${errors.name ? 'input-error' : ''}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Server"
            />
            {errors.name && (
              <p className="text-error text-xs mt-1">{errors.name}</p>
            )}
          </fieldset>
        </div>

        {/* Connection section */}
        <div className="bg-base-200/50 rounded-xl border border-base-content/5 p-4 space-y-4">
          <h3 className="text-[10px] font-semibold uppercase tracking-widest text-base-content/40">
            Connection
          </h3>
          <div className="flex gap-3">
            <fieldset className="fieldset flex-1">
              <label className="fieldset-label text-xs font-medium text-base-content/70" htmlFor="host-address">
                Host / IP
              </label>
              <input
                id="host-address"
                type="text"
                className={`input input-bordered input-sm w-full bg-base-300/20 focus:border-primary/30 rounded-lg transition-colors placeholder:text-base-content/30 ${errors.address ? 'input-error' : ''}`}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="192.168.1.100 or example.com"
              />
              {errors.address && (
                <p className="text-error text-xs mt-1">{errors.address}</p>
              )}
            </fieldset>

            <fieldset className="fieldset w-24">
              <label className="fieldset-label text-xs font-medium text-base-content/70" htmlFor="host-port">
                Port
              </label>
              <input
                id="host-port"
                type="number"
                className={`input input-bordered input-sm w-full bg-base-300/20 focus:border-primary/30 rounded-lg transition-colors ${errors.port ? 'input-error' : ''}`}
                value={port}
                onChange={(e) => setPort(Number(e.target.value))}
                min={1}
                max={65535}
              />
              {errors.port && (
                <p className="text-error text-xs mt-1">{errors.port}</p>
              )}
            </fieldset>
          </div>
        </div>

        {/* Authentication section */}
        <div className="bg-base-200/50 rounded-xl border border-base-content/5 p-4 space-y-4">
          <h3 className="text-[10px] font-semibold uppercase tracking-widest text-base-content/40">
            Authentication
          </h3>
          <fieldset className="fieldset">
            <label className="fieldset-label text-xs font-medium text-base-content/70" htmlFor="host-username">
              Username
            </label>
            <input
              id="host-username"
              type="text"
              className={`input input-bordered input-sm w-full bg-base-300/20 focus:border-primary/30 rounded-lg transition-colors placeholder:text-base-content/30 ${errors.username ? 'input-error' : ''}`}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="root"
            />
            {errors.username && (
              <p className="text-error text-xs mt-1">{errors.username}</p>
            )}
          </fieldset>

          <fieldset className="fieldset">
            <label className="fieldset-label text-xs font-medium text-base-content/70" htmlFor="host-keychain">
              Keychain
            </label>
            <select
              id="host-keychain"
              className="select select-bordered select-sm w-full bg-base-300/20 focus:border-primary/30 rounded-lg transition-colors"
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
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn btn-ghost btn-sm rounded-lg" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-sm rounded-lg">
            {host ? 'Save' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  )
}
