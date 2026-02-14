import { useEffect, useRef, useState } from 'react'
import { Terminal as XTerm } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
import type { Host, KeychainEntry } from '@shared/types'
import { buildSshConfig } from '../types'

type Status = 'connecting' | 'connected' | 'disconnected' | 'error'

interface TerminalProps {
  host: Host
  keychain: KeychainEntry[]
  sessionId: string
  onDisconnect: () => void
}

export function TerminalView({
  host,
  keychain,
  sessionId,
  onDisconnect
}: TerminalProps): React.JSX.Element {
  const termRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<XTerm | null>(null)
  const fitRef = useRef<FitAddon | null>(null)
  const [status, setStatus] = useState<Status>('connecting')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const styles = getComputedStyle(document.documentElement)
    const termBg = styles.getPropertyValue('--terminal-bg').trim() || '#1d232a'
    const termFg = styles.getPropertyValue('--terminal-fg').trim() || '#a6adbb'
    const termCursor = styles.getPropertyValue('--terminal-cursor').trim() || '#a6adbb'
    const termSelection = styles.getPropertyValue('--terminal-selection').trim() || 'rgba(166, 173, 187, 0.2)'

    const term = new XTerm({
      cursorBlink: true,
      theme: {
        background: termBg,
        foreground: termFg,
        cursor: termCursor,
        selectionBackground: termSelection
      },
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      fontSize: 14
    })
    const fit = new FitAddon()
    term.loadAddon(fit)
    xtermRef.current = term
    fitRef.current = fit

    if (termRef.current) {
      term.open(termRef.current)
      fit.fit()
    }

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

    const handleWindowResize = (): void => {
      fit.fit()
    }
    window.addEventListener('resize', handleWindowResize)

    // Connect
    const config = buildSshConfig(host, keychain)

    window.api
      .sshConnect(sessionId, config)
      .then(() => {
        setStatus('connected')
        fit.fit()
        window.api.sshResize(sessionId, term.cols, term.rows)
      })
      .catch((err: Error) => {
        setStatus('error')
        setErrorMsg(err.message || 'Connection failed')
      })

    return () => {
      removeDataListener()
      removeClosedListener()
      onData.dispose()
      onResize.dispose()
      window.removeEventListener('resize', handleWindowResize)
      window.api.sshDisconnect(sessionId)
      term.dispose()
    }
  }, [sessionId, host, keychain])

  const handleReconnect = (): void => {
    setStatus('connecting')
    setErrorMsg('')

    const config = buildSshConfig(host, keychain)
    xtermRef.current?.clear()

    window.api
      .sshConnect(sessionId, config)
      .then(() => {
        setStatus('connected')
        if (fitRef.current) fitRef.current.fit()
        if (xtermRef.current) {
          window.api.sshResize(sessionId, xtermRef.current.cols, xtermRef.current.rows)
        }
      })
      .catch((err: Error) => {
        setStatus('error')
        setErrorMsg(err.message || 'Connection failed')
      })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2 bg-base-200 border-b border-base-300">
        <span className="font-medium text-sm">{host.name}</span>
        <span className="text-xs text-base-content/50">
          {host.username}@{host.address}:{host.port}
        </span>
        <div className="flex-1" />
        {status === 'connecting' && (
          <span className="loading loading-spinner loading-xs" />
        )}
        {status === 'connected' && (
          <span className="badge badge-success badge-xs">Connected</span>
        )}
        {(status === 'disconnected' || status === 'error') && (
          <button className="btn btn-ghost btn-xs" onClick={handleReconnect}>
            Reconnect
          </button>
        )}
        <button className="btn btn-ghost btn-xs text-error" onClick={onDisconnect}>
          Disconnect
        </button>
      </div>

      {/* Terminal area */}
      <div className="flex-1 relative">
        <div ref={termRef} className="absolute inset-0 p-1" />

        {status === 'connecting' && (
          <div className="absolute inset-0 flex items-center justify-center bg-base-300/80">
            <div className="flex items-center gap-2">
              <span className="loading loading-spinner loading-md" />
              <span className="text-sm">Connecting to {host.address}...</span>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center bg-base-300/80">
            <div className="text-center">
              <p className="text-error font-medium mb-1">Connection Failed</p>
              <p className="text-sm text-base-content/60 mb-3">{errorMsg}</p>
              <button className="btn btn-primary btn-sm" onClick={handleReconnect}>
                Retry
              </button>
            </div>
          </div>
        )}

        {status === 'disconnected' && (
          <div className="absolute inset-0 flex items-center justify-center bg-base-300/80">
            <div className="text-center">
              <p className="text-base-content/60 font-medium mb-1">Disconnected</p>
              <button className="btn btn-primary btn-sm" onClick={handleReconnect}>
                Reconnect
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
