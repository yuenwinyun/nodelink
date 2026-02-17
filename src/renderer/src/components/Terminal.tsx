import { useEffect, useRef, useState, useCallback } from 'react'
import { Terminal as XTerm } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
import { Code, ArrowUpDown, X, RefreshCw } from './icons'
import { StatusPill } from './StatusPill'
import type { Host, KeychainEntry, Snippet, TunnelConfig } from '@shared/types'
import { buildSshConfig } from '../types'
import type { ActiveTunnel } from '../types'
import { SnippetPanel } from './SnippetPanel'
import { TunnelPanel } from './TunnelPanel'

type Status = 'connecting' | 'connected' | 'disconnected' | 'error'

interface TerminalProps {
  host: Host
  keychain: KeychainEntry[]
  snippets: Snippet[]
  sessionId: string
  visible: boolean
  pendingReconnect: boolean
  onReconnectHandled: () => void
  onDisconnect: () => void
  onUpdateHost: (id: string, input: Partial<Omit<Host, 'id' | 'createdAt' | 'updatedAt'>>) => void
}

export function TerminalView({
  host,
  keychain,
  snippets,
  sessionId,
  visible,
  pendingReconnect,
  onReconnectHandled,
  onDisconnect,
  onUpdateHost
}: TerminalProps): React.JSX.Element {
  const termRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<XTerm | null>(null)
  const fitRef = useRef<FitAddon | null>(null)
  const [status, setStatus] = useState<Status>('connecting')
  const [errorMsg, setErrorMsg] = useState('')
  const [snippetPanelOpen, setSnippetPanelOpen] = useState(false)
  const [tunnelPanelOpen, setTunnelPanelOpen] = useState(false)
  const [activeTunnels, setActiveTunnels] = useState<ActiveTunnel[]>([])
  const [tunnelError, setTunnelError] = useState<string | null>(null)

  // Refit terminal when becoming visible or when side panels toggle
  useEffect(() => {
    if (visible && fitRef.current) {
      requestAnimationFrame(() => {
        fitRef.current?.fit()
      })
    }
  }, [visible, snippetPanelOpen, tunnelPanelOpen])

  // Handle reconnect request from sessions tab context menu
  useEffect(() => {
    if (pendingReconnect) {
      onReconnectHandled()
      // Trigger reconnect
      setStatus('connecting')
      setErrorMsg('')
      const config = buildSshConfig(host, keychain)
      xtermRef.current?.clear()
      window.api
        .sshConnect(sessionId, config)
        .then(() => {
          setStatus('connected')
          requestAnimationFrame(() => {
            if (fitRef.current) fitRef.current.fit()
            if (xtermRef.current) {
              window.api.sshResize(sessionId, xtermRef.current.cols, xtermRef.current.rows)
            }
          })
        })
        .catch((err: Error) => {
          setStatus('error')
          setErrorMsg(err.message || 'Connection failed')
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingReconnect])

  useEffect(() => {
    const container = termRef.current
    if (!container) return

    const styles = getComputedStyle(document.documentElement)
    const termBg = styles.getPropertyValue('--terminal-bg').trim() || '#11111b'
    const termFg = styles.getPropertyValue('--terminal-fg').trim() || '#cdd6f4'
    const termCursor = styles.getPropertyValue('--terminal-cursor').trim() || '#89b4fa'
    const termSelection =
      styles.getPropertyValue('--terminal-selection').trim() || 'rgba(137, 180, 250, 0.18)'

    const term = new XTerm({
      cursorBlink: true,
      theme: {
        background: termBg,
        foreground: termFg,
        cursor: termCursor,
        selectionBackground: termSelection
      },
      fontFamily:
        '"MesloLGM Nerd Font Mono", "MesloLGS Nerd Font Mono", "MesloLGS NF", "Meslo LG M for Powerline", Hack, Menlo, Monaco, "Courier New", monospace',
      fontSize: 14
    })
    const fit = new FitAddon()
    term.loadAddon(fit)
    xtermRef.current = term
    fitRef.current = fit

    term.open(container)

    // Delay initial fit until layout has settled
    requestAnimationFrame(() => {
      fit.fit()
    })

    // Handle incoming data
    const removeDataListener = window.api.onSshData((sid, data) => {
      if (sid === sessionId) {
        term.write(data)
      }
    })

    // Handle session close
    const removeClosedListener = window.api.onSshClosed((sid) => {
      if (sid === sessionId) {
        setStatus('disconnected')
      }
    })

    // Send keystrokes
    const onData = term.onData((data) => {
      window.api.sshInput(sessionId, data)
    })

    // Resize handling
    const onResize = term.onResize(({ cols, rows }) => {
      window.api.sshResize(sessionId, cols, rows)
    })

    // Use ResizeObserver on the container for reliable resize tracking
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        fit.fit()
      })
    })
    resizeObserver.observe(container)

    // Connect
    const config = buildSshConfig(host, keychain)

    window.api
      .sshConnect(sessionId, config)
      .then(() => {
        setStatus('connected')
        requestAnimationFrame(() => {
          fit.fit()
          window.api.sshResize(sessionId, term.cols, term.rows)
        })
      })
      .catch((err: Error) => {
        setStatus('error')
        setErrorMsg(err.message || 'Connection failed')
      })

    // Cleanup only removes listeners and observer.
    // SSH disconnect and term dispose are handled by handleDisconnect.
    return () => {
      removeDataListener()
      removeClosedListener()
      onData.dispose()
      onResize.dispose()
      resizeObserver.disconnect()
      window.api.tunnelStopAll(sessionId)
      window.api.sshDisconnect(sessionId)
      term.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId])

  const handleReconnect = (): void => {
    setStatus('connecting')
    setErrorMsg('')

    const config = buildSshConfig(host, keychain)
    xtermRef.current?.clear()

    window.api
      .sshConnect(sessionId, config)
      .then(() => {
        setStatus('connected')
        requestAnimationFrame(() => {
          if (fitRef.current) fitRef.current.fit()
          if (xtermRef.current) {
            window.api.sshResize(sessionId, xtermRef.current.cols, xtermRef.current.rows)
          }
        })
      })
      .catch((err: Error) => {
        setStatus('error')
        setErrorMsg(err.message || 'Connection failed')
      })
  }

  const handleDisconnect = (): void => {
    window.api.tunnelStopAll(sessionId)
    setActiveTunnels([])
    window.api.sshDisconnect(sessionId)
    xtermRef.current?.dispose()
    xtermRef.current = null
    fitRef.current = null
    onDisconnect()
  }

  const handleSendSnippet = useCallback(
    (command: string): void => {
      window.api.sshInput(sessionId, command + '\n')
      xtermRef.current?.focus()
    },
    [sessionId]
  )

  // --- Tunnel handlers ---

  const handleSaveTunnel = useCallback(
    (config: TunnelConfig): void => {
      const updated = [...(host.tunnels ?? []), config]
      onUpdateHost(host.id, { tunnels: updated })
    },
    [host, onUpdateHost]
  )

  const handleDeleteTunnel = useCallback(
    (tunnelId: string): void => {
      const updated = (host.tunnels ?? []).filter((t) => t.id !== tunnelId)
      onUpdateHost(host.id, { tunnels: updated })
    },
    [host, onUpdateHost]
  )

  const handleStartTunnel = useCallback(
    async (config: TunnelConfig): Promise<void> => {
      setTunnelError(null)
      try {
        const result = await window.api.tunnelStart(sessionId, config)
        setActiveTunnels((prev) => [
          ...prev,
          { tunnelId: result.tunnelId, localPort: result.localPort, name: config.name }
        ])
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to start tunnel'
        setTunnelError(msg)
      }
    },
    [sessionId]
  )

  const handleStopTunnel = useCallback(
    async (tunnelId: string): Promise<void> => {
      await window.api.tunnelStop(sessionId, tunnelId)
      setActiveTunnels((prev) => prev.filter((t) => t.tunnelId !== tunnelId))
    },
    [sessionId]
  )

  const handleOpenBrowser = useCallback((localPort: number): void => {
    window.api.tunnelOpenBrowser(localPort)
  }, [])

  // Clean up tunnel error after a delay
  useEffect(() => {
    if (!tunnelError) return
    const timer = setTimeout(() => setTunnelError(null), 5000)
    return () => clearTimeout(timer)
  }, [tunnelError])

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-1.5 px-3 h-10 bg-base-200/50 border-b border-base-content/5 shrink-0">
        <span className="text-xs text-base-content/50 truncate mr-auto">
          {host.username}@{host.address}:{host.port}
        </span>
        <StatusPill status={status} />
        {(status === 'disconnected' || status === 'error') && (
          <button className="btn btn-ghost btn-xs gap-1 text-xs" onClick={handleReconnect}>
            <RefreshCw className="w-3 h-3" />
            Reconnect
          </button>
        )}
        <div className="w-px h-4 bg-base-content/10 mx-0.5" />
        <button
          className={`btn btn-ghost btn-xs btn-square ${tunnelPanelOpen ? 'btn-active' : ''}`}
          onClick={() => setTunnelPanelOpen((prev) => !prev)}
          aria-label="Toggle tunnels panel"
          title="Tunnels"
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          {activeTunnels.length > 0 && (
            <span className="badge badge-xs badge-success absolute -top-0.5 -right-0.5">{activeTunnels.length}</span>
          )}
        </button>
        <button
          className={`btn btn-ghost btn-xs btn-square ${snippetPanelOpen ? 'btn-active' : ''}`}
          onClick={() => setSnippetPanelOpen((prev) => !prev)}
          aria-label="Toggle snippets panel"
          title="Snippets"
        >
          <Code className="w-3.5 h-3.5" />
        </button>
        <div className="w-px h-4 bg-base-content/10 mx-0.5" />
        <button
          className="btn btn-ghost btn-xs btn-square text-base-content/40 hover:text-error hover:bg-error/10 transition-colors"
          onClick={handleDisconnect}
          aria-label="Disconnect"
          title="Disconnect"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Terminal area + side panels */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 relative">
          <div ref={termRef} className="absolute inset-0 p-2" />

          {/* Accessibility: announce status changes */}
          <div className="sr-only" aria-live="polite">
            {status === 'connected' && `Connected to ${host.name}`}
            {status === 'disconnected' && `Disconnected from ${host.name}`}
          </div>

          {/* Bottom-anchored status banners */}
          {status === 'connecting' && (
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-center p-4 animate-slide-in-bottom">
              <div className="glass-surface bg-base-200/80 rounded-xl px-5 py-3 shadow-xl border border-base-content/5 flex items-center gap-3">
                <span className="loading loading-spinner loading-sm text-primary" />
                <span className="text-sm text-base-content/60">Connecting to {host.address}...</span>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-center p-4 animate-slide-in-bottom">
              <div className="glass-surface bg-base-200/80 rounded-xl px-5 py-3 shadow-xl border border-base-content/5 text-center">
                <p className="text-error font-medium text-sm mb-1">Connection Failed</p>
                <p className="text-xs text-base-content/50 mb-3">{errorMsg}</p>
                <button className="btn btn-primary btn-sm btn-outline rounded-lg" onClick={handleReconnect}>
                  Retry
                </button>
              </div>
            </div>
          )}

          {status === 'disconnected' && (
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-center p-4 animate-slide-in-bottom">
              <div className="glass-surface bg-base-200/80 rounded-xl px-5 py-3 shadow-xl border border-base-content/5 flex items-center gap-3">
                <span className="text-sm text-base-content/60">Session ended</span>
                <button className="btn btn-primary btn-sm btn-outline rounded-lg" onClick={handleReconnect}>
                  Reconnect
                </button>
              </div>
            </div>
          )}
        </div>

        <TunnelPanel
          tunnels={host.tunnels ?? []}
          activeTunnels={activeTunnels}
          isOpen={tunnelPanelOpen}
          onSaveTunnel={handleSaveTunnel}
          onDeleteTunnel={handleDeleteTunnel}
          onStart={handleStartTunnel}
          onStop={handleStopTunnel}
          onOpenBrowser={handleOpenBrowser}
          onClose={() => setTunnelPanelOpen(false)}
        />

        <SnippetPanel
          snippets={snippets}
          isOpen={snippetPanelOpen}
          onSend={handleSendSnippet}
          onClose={() => setSnippetPanelOpen(false)}
        />
      </div>

      {/* Tunnel error toast */}
      {tunnelError && (
        <div className="absolute bottom-4 right-4 z-50">
          <div className="alert alert-error alert-sm shadow-lg rounded-xl">
            <span className="text-xs">{tunnelError}</span>
          </div>
        </div>
      )}
    </div>
  )
}
