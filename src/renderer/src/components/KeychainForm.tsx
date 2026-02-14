import { useState, useEffect } from 'react'
import * as Toggle from '@radix-ui/react-toggle'
import type { KeychainEntry } from '@shared/types'

interface KeychainFormProps {
  entry: KeychainEntry | null // null = create mode
  onSave: (input: Omit<KeychainEntry, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

export function KeychainForm({
  entry,
  onSave,
  onCancel
}: KeychainFormProps): React.JSX.Element {
  const [label, setLabel] = useState('')
  const [username, setUsername] = useState('')
  const [authType, setAuthType] = useState<'password' | 'key'>('password')
  const [password, setPassword] = useState('')
  const [sshKey, setSshKey] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (entry) {
      setLabel(entry.label)
      setUsername(entry.username)
      setAuthType(entry.authType)
      setPassword(entry.password)
      setSshKey(entry.sshKey)
    }
  }, [entry])

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!label.trim()) errs.label = 'Label is required'
    if (!username.trim()) errs.username = 'Username is required'
    if (authType === 'password' && !password) errs.password = 'Password is required'
    if (authType === 'key' && !sshKey.trim()) errs.sshKey = 'SSH key is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    if (!validate()) return
    onSave({
      label: label.trim(),
      username: username.trim(),
      authType,
      password: authType === 'password' ? password : '',
      sshKey: authType === 'key' ? sshKey.trim() : ''
    })
  }

  return (
    <div className="max-w-lg mx-auto p-6">
      <h2 className="text-xl font-bold mb-6">
        {entry ? 'Edit Keychain Entry' : 'New Keychain Entry'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <fieldset className="fieldset">
          <label className="fieldset-label" htmlFor="kc-label">Label</label>
          <input
            id="kc-label"
            type="text"
            className={`input input-bordered w-full ${errors.label ? 'input-error' : ''}`}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Production Server Key"
          />
          {errors.label && <p className="text-error text-xs mt-1">{errors.label}</p>}
        </fieldset>

        <fieldset className="fieldset">
          <label className="fieldset-label" htmlFor="kc-username">Username</label>
          <input
            id="kc-username"
            type="text"
            className={`input input-bordered w-full ${errors.username ? 'input-error' : ''}`}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="root"
          />
          {errors.username && <p className="text-error text-xs mt-1">{errors.username}</p>}
        </fieldset>

        <fieldset className="fieldset">
          <label className="fieldset-label">Auth Type</label>
          <div className="flex gap-4">
            <label className="label cursor-pointer gap-2">
              <input
                type="radio"
                name="authType"
                className="radio radio-primary radio-sm"
                checked={authType === 'password'}
                onChange={() => setAuthType('password')}
              />
              <span className="label-text">Password</span>
            </label>
            <label className="label cursor-pointer gap-2">
              <input
                type="radio"
                name="authType"
                className="radio radio-primary radio-sm"
                checked={authType === 'key'}
                onChange={() => setAuthType('key')}
              />
              <span className="label-text">SSH Key</span>
            </label>
          </div>
        </fieldset>

        {authType === 'password' ? (
          <fieldset className="fieldset">
            <label className="fieldset-label" htmlFor="kc-password">Password</label>
            <div className="relative">
              <input
                id="kc-password"
                type={showPassword ? 'text' : 'password'}
                className={`input input-bordered w-full pr-16 ${errors.password ? 'input-error' : ''}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Toggle.Root
                pressed={showPassword}
                onPressedChange={setShowPassword}
                aria-label="Toggle password visibility"
                className="btn btn-ghost btn-xs absolute right-2 top-1/2 -translate-y-1/2"
              >
                {showPassword ? 'Hide' : 'Show'}
              </Toggle.Root>
            </div>
            {errors.password && <p className="text-error text-xs mt-1">{errors.password}</p>}
          </fieldset>
        ) : (
          <fieldset className="fieldset">
            <label className="fieldset-label" htmlFor="kc-sshkey">SSH Private Key</label>
            <textarea
              id="kc-sshkey"
              className={`textarea textarea-bordered w-full font-mono text-xs ${errors.sshKey ? 'textarea-error' : ''}`}
              rows={8}
              value={sshKey}
              onChange={(e) => setSshKey(e.target.value)}
              placeholder="-----BEGIN OPENSSH PRIVATE KEY-----&#10;..."
            />
            {errors.sshKey && <p className="text-error text-xs mt-1">{errors.sshKey}</p>}
          </fieldset>
        )}

        <div className="flex gap-2 pt-2">
          <button type="submit" className="btn btn-primary">
            {entry ? 'Save' : 'Create'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
