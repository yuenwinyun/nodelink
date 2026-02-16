import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { TunnelConfig } from '@shared/types'
import type { ActiveTunnel } from '../types'

interface TunnelPanelProps {
  tunnels: TunnelConfig[]
  activeTunnels: ActiveTunnel[]
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
    <div className="w-72 min-w-[288px] bg-base-200 border-l border-base-300 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-base-300">
        <span className="font-medium text-sm">Port Forwarding</span>
        <button className="btn btn-ghost btn-xs" onClick={onClose} title="Close panel">
          &times;
        </button>
      </div>

      {/* Tunnel list */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
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
              className="rounded-btn bg-base-300 p-2.5 mb-2"
            >
              <div className="flex items-center gap-2 mb-1">
                {isActive ? (
                  <span className="badge badge-xs badge-success" />
                ) : (
                  <span className="badge badge-xs badge-ghost" />
                )}
                <span className="font-medium text-xs truncate flex-1">{tunnel.name}</span>
                <button
                  className="btn btn-ghost btn-xs px-1 min-h-0 h-auto text-base-content/40 hover:text-error"
                  onClick={() => {
                    if (isActive) onStop(tunnel.id)
                    onDeleteTunnel(tunnel.id)
                  }}
                  title="Delete tunnel"
                >
                  &times;
                </button>
              </div>

              <div className="text-xs text-base-content/50 font-mono mb-2">
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
                      className="btn btn-primary btn-xs flex-1"
                      onClick={() => onOpenBrowser(tunnel.localPort)}
                    >
                      Open in Browser
                    </button>
                  </>
                ) : (
                  <button
                    className="btn btn-success btn-xs flex-1"
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
          <div className="rounded-btn bg-base-300 p-2.5 mb-2">
            <div className="flex flex-col gap-2">
              <fieldset className="fieldset">
                <label className="fieldset-label text-xs">Name</label>
                <input
                  type="text"
                  className="input input-bordered input-xs w-full"
                  placeholder="e.g. Dev Server"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </fieldset>

              <fieldset className="fieldset">
                <label className="fieldset-label text-xs">Local Port</label>
                <input
                  type="number"
                  className="input input-bordered input-xs w-full"
                  placeholder="e.g. 8080"
                  value={localPort}
                  onChange={(e) => setLocalPort(e.target.value)}
                />
              </fieldset>

              <fieldset className="fieldset">
                <label className="fieldset-label text-xs">Remote Host</label>
                <input
                  type="text"
                  className="input input-bordered input-xs w-full"
                  placeholder="localhost"
                  value={remoteHost}
                  onChange={(e) => setRemoteHost(e.target.value)}
                />
              </fieldset>

              <fieldset className="fieldset">
                <label className="fieldset-label text-xs">Remote Port</label>
                <input
                  type="number"
                  className="input input-bordered input-xs w-full"
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
        <div className="p-2 border-t border-base-300">
          <button
            className="btn btn-primary btn-xs w-full"
            onClick={() => setShowForm(true)}
          >
            + Add Tunnel
          </button>
        </div>
      )}
    </div>
  )
}
