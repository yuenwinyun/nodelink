import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { X, Plus } from 'lucide-react'
import type { TunnelConfig } from '@shared/types'
import type { ActiveTunnel } from '../types'

interface TunnelPanelProps {
  tunnels: TunnelConfig[]
  activeTunnels: ActiveTunnel[]
  isOpen: boolean
  onSaveTunnel: (config: TunnelConfig) => void
  onDeleteTunnel: (tunnelId: string) => void
  onStart: (config: TunnelConfig) => void
  onStop: (tunnelId: string) => void
  onOpenBrowser: (localPort: number) => void
  onClose: () => void
}

export function TunnelPanel({
  tunnels,
  activeTunnels,
  isOpen,
  onSaveTunnel,
  onDeleteTunnel,
  onStart,
  onStop,
  onOpenBrowser,
  onClose
}: TunnelPanelProps): React.JSX.Element {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [localPort, setLocalPort] = useState('')
  const [remoteHost, setRemoteHost] = useState('localhost')
  const [remotePort, setRemotePort] = useState('')
  const [error, setError] = useState('')

  const activeIds = new Set(activeTunnels.map((t) => t.tunnelId))

  const resetForm = (): void => {
    setName('')
    setLocalPort('')
    setRemoteHost('localhost')
    setRemotePort('')
    setError('')
    setShowForm(false)
  }

  const handleAdd = (): void => {
    const lp = parseInt(localPort, 10)
    const rp = parseInt(remotePort, 10)

    if (!name.trim()) {
      setError('Name is required')
      return
    }
    if (!lp || lp < 1 || lp > 65535) {
      setError('Local port must be 1-65535')
      return
    }
    if (!remoteHost.trim()) {
      setError('Remote host is required')
      return
    }
    if (!rp || rp < 1 || rp > 65535) {
      setError('Remote port must be 1-65535')
      return
    }

    onSaveTunnel({
      id: uuidv4(),
      name: name.trim(),
      localPort: lp,
      remoteHost: remoteHost.trim(),
      remotePort: rp
    })
    resetForm()
  }

  return (
    <div className={`
      bg-base-200 border-l border-base-content/5 flex flex-col h-full
      transition-all duration-200 ease-out overflow-hidden
      ${isOpen ? 'w-72 min-w-[288px] opacity-100' : 'w-0 min-w-0 opacity-0'}
    `}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-base-content/5">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">Port Forwarding</span>
          {tunnels.length > 0 && (
            <span className="badge badge-xs badge-ghost">{tunnels.length}</span>
          )}
        </div>
        <button
          className="btn btn-ghost btn-xs btn-square"
          onClick={onClose}
          aria-label="Close tunnels panel"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tunnel list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-2 py-2">
        {tunnels.length === 0 && !showForm && (
          <div className="text-center text-base-content/40 py-6 text-xs">
            No tunnels configured. Add one to forward a local port to a remote service.
          </div>
        )}

        {tunnels.map((tunnel) => {
          const isActive = activeIds.has(tunnel.id)
          return (
            <div
              key={tunnel.id}
              className="rounded-lg bg-base-300/40 p-2.5 mb-2"
            >
              <div className="flex items-center gap-2 mb-1">
                {isActive ? (
                  <span className="w-2 h-2 rounded-full bg-success shadow-[0_0_6px_theme(colors.success/40%)]" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-base-content/20" />
                )}
                <span className="font-medium text-xs truncate flex-1">{tunnel.name}</span>
                <button
                  className="btn btn-ghost btn-xs btn-square text-base-content/40 hover:text-error"
                  onClick={() => {
                    if (isActive) onStop(tunnel.id)
                    onDeleteTunnel(tunnel.id)
                  }}
                  aria-label={`Delete tunnel ${tunnel.name}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              <div className="text-[11px] text-base-content/40 font-mono mb-2">
                :{tunnel.localPort} &rarr; {tunnel.remoteHost}:{tunnel.remotePort}
              </div>

              <div className="flex items-center gap-1.5">
                {isActive ? (
                  <>
                    <button
                      className="btn btn-ghost btn-xs"
                      onClick={() => onStop(tunnel.id)}
                    >
                      Stop
                    </button>
                    <button
                      className="btn btn-primary btn-xs btn-outline flex-1"
                      onClick={() => onOpenBrowser(tunnel.localPort)}
                    >
                      Open in Browser
                    </button>
                  </>
                ) : (
                  <button
                    className="btn btn-success btn-xs btn-outline flex-1"
                    onClick={() => onStart(tunnel)}
                  >
                    Start
                  </button>
                )}
              </div>
            </div>
          )
        })}

        {/* Add form */}
        {showForm && (
          <div className="rounded-lg bg-base-300/40 p-2.5 mb-2">
            <div className="flex flex-col gap-2">
              <fieldset className="fieldset">
                <label className="fieldset-label text-xs font-medium text-base-content/70">Name</label>
                <input
                  type="text"
                  className="input input-bordered input-xs w-full bg-base-300/30 focus:bg-base-300/50 transition-colors"
                  placeholder="e.g. Dev Server"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </fieldset>

              <fieldset className="fieldset">
                <label className="fieldset-label text-xs font-medium text-base-content/70">Local Port</label>
                <input
                  type="number"
                  className="input input-bordered input-xs w-full bg-base-300/30 focus:bg-base-300/50 transition-colors"
                  placeholder="e.g. 8080"
                  value={localPort}
                  onChange={(e) => setLocalPort(e.target.value)}
                />
              </fieldset>

              <fieldset className="fieldset">
                <label className="fieldset-label text-xs font-medium text-base-content/70">Remote Host</label>
                <input
                  type="text"
                  className="input input-bordered input-xs w-full bg-base-300/30 focus:bg-base-300/50 transition-colors"
                  placeholder="localhost"
                  value={remoteHost}
                  onChange={(e) => setRemoteHost(e.target.value)}
                />
              </fieldset>

              <fieldset className="fieldset">
                <label className="fieldset-label text-xs font-medium text-base-content/70">Remote Port</label>
                <input
                  type="number"
                  className="input input-bordered input-xs w-full bg-base-300/30 focus:bg-base-300/50 transition-colors"
                  placeholder="e.g. 3000"
                  value={remotePort}
                  onChange={(e) => setRemotePort(e.target.value)}
                />
              </fieldset>

              {error && <p className="text-error text-xs">{error}</p>}

              <div className="flex gap-1.5 mt-1">
                <button className="btn btn-ghost btn-xs flex-1" onClick={resetForm}>
                  Cancel
                </button>
                <button className="btn btn-primary btn-xs flex-1" onClick={handleAdd}>
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {!showForm && (
        <div className="p-2 border-t border-base-content/5">
          <button
            className="btn btn-ghost btn-xs btn-block bg-base-300/40 hover:bg-base-300 gap-1.5 justify-start font-normal"
            onClick={() => setShowForm(true)}
          >
            <Plus className="w-3.5 h-3.5 text-base-content/50" />
            <span className="text-xs">Add Tunnel</span>
          </button>
        </div>
      )}
    </div>
  )
}
