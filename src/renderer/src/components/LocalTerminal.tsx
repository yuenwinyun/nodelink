import { useEffect, useRef, useState, useCallback } from 'react'
import { Terminal as XTerm } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
import { Code, X } from './icons'
import type { Snippet } from '@shared/types'
import { SnippetPanel } from './SnippetPanel'

type Status = 'starting' | 'running' | 'exited'

interface LocalTerminalProps {
  sessionId: string
  snippets: Snippet[]
  visible: boolean
  onClose: () => void
}

export function LocalTerminalView({
  sessionId,
  snippets,
  visible,
  onClose
}: LocalTerminalProps): React.JSX.Element {
  const termRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<XTerm | null>(null)
  const fitRef = useRef<FitAddon | null>(null)
  const [status, setStatus] = useState<Status>('starting')
  const [exitCode, setExitCode] = useState<number | null>(null)
  const [snippetPanelOpen, setSnippetPanelOpen] = useState(false)

  // Refit terminal when becoming visible or when snippet panel toggles
  useEffect(() => {
    if (visible && fitRef.current) {
      requestAnimationFrame(() => {
        fitRef.current?.fit()
      })
    }
  }, [visible, snippetPanelOpen])

  useEffect(() => {
    const container = termRef.current
    if (!container) return

    const styles = getComputedStyle(document.documentElement)
    const termBg = styles.getPropertyValue('--terminal-bg').trim() || '#1a1e24'
    const termFg = styles.getPropertyValue('--terminal-fg').trim() || '#c8cdd5'
    const termCursor = styles.getPropertyValue('--terminal-cursor').trim() || '#c8cdd5'
    const termSelection =
      styles.getPropertyValue('--terminal-selection').trim() || 'rgba(200, 205, 213, 0.15)'

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

    // Handle incoming data from PTY
    const removeDataListener = window.api.onPtyData((sid, data) => {
      if (sid === sessionId) {
        term.write(data)
      }
    })

    // Handle PTY exit
    const removeExitListener = window.api.onPtyExit((sid, code) => {
      if (sid === sessionId) {
        setStatus('exited')
        setExitCode(code)
      }
    })

    // Send keystrokes to PTY
    const onData = term.onData((data) => {
      window.api.ptyInput(sessionId, data)
    })

    // Resize handling
    const onResize = term.onResize(({ cols, rows }) => {
      window.api.ptyResize(sessionId, cols, rows)
    })

    // Use ResizeObserver on the container for reliable resize tracking
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        fit.fit()
      })
    })
    resizeObserver.observe(container)

    // Spawn the local shell
    window.api
      .ptySpawn(sessionId)
      .then(() => {
        setStatus('running')
        requestAnimationFrame(() => {
          fit.fit()
          window.api.ptyResize(sessionId, term.cols, term.rows)
        })
      })
      .catch(() => {
        setStatus('exited')
        setExitCode(-1)
      })

    return () => {
      removeDataListener()
      removeExitListener()
      onData.dispose()
      onResize.dispose()
      resizeObserver.disconnect()
      window.api.ptyKill(sessionId)
      term.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId])

  const handleRespawn = (): void => {
    setStatus('starting')
    setExitCode(null)
    xtermRef.current?.clear()

    window.api
      .ptySpawn(sessionId)
      .then(() => {
        setStatus('running')
        requestAnimationFrame(() => {
          if (fitRef.current) fitRef.current.fit()
          if (xtermRef.current) {
            window.api.ptyResize(sessionId, xtermRef.current.cols, xtermRef.current.rows)
          }
        })
      })
      .catch(() => {
        setStatus('exited')
        setExitCode(-1)
      })
  }

  const handleClose = (): void => {
    window.api.ptyKill(sessionId)
    xtermRef.current?.dispose()
    xtermRef.current = null
    fitRef.current = null
    onClose()
  }

  const handleSendSnippet = useCallback(
    (command: string): void => {
      window.api.ptyInput(sessionId, command + '\n')
      xtermRef.current?.focus()
    },
    [sessionId]
  )

  return (
    <div className="flex flex-col h-full">
      {/* Compact toolbar */}
      <div className="flex items-center gap-1 px-2 h-8 bg-base-200/50 border-b border-base-content/5 shrink-0">
        <span className="text-xs text-base-content/50 mr-auto">Local Shell</span>
        {status === 'starting' && <span className="loading loading-spinner loading-xs" />}
        {status === 'running' && (
          <span className="badge badge-info badge-xs badge-outline gap-1">Running</span>
        )}
        {status === 'exited' && (
          <button className="btn btn-ghost btn-xs text-xs" onClick={handleRespawn}>
            Restart
          </button>
        )}
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
          className="btn btn-ghost btn-xs btn-square text-error/60 hover:text-error"
          onClick={handleClose}
          aria-label="Close terminal"
          title="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Terminal area + snippet panel */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 relative">
          <div ref={termRef} className="absolute inset-0 p-1" />

          {/* Bottom-anchored status banners */}
          {status === 'starting' && (
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-center p-4 bg-gradient-to-t from-base-300/95 to-base-300/0">
              <div className="bg-base-200 rounded-lg px-5 py-3 shadow-lg flex items-center gap-3">
                <span className="loading loading-spinner loading-sm" />
                <span className="text-sm text-base-content/60">Starting shell...</span>
              </div>
            </div>
          )}

          {status === 'exited' && (
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-center p-4 bg-gradient-to-t from-base-300/95 to-base-300/0">
              <div className="bg-base-200 rounded-lg px-5 py-3 shadow-lg flex items-center gap-3">
                <span className="text-sm text-base-content/60">
                  Process exited{exitCode !== null ? ` (code ${exitCode})` : ''}
                </span>
                <button className="btn btn-primary btn-sm btn-outline" onClick={handleRespawn}>
                  Restart
                </button>
              </div>
            </div>
          )}
        </div>

        <SnippetPanel
          snippets={snippets}
          isOpen={snippetPanelOpen}
          onSend={handleSendSnippet}
          onClose={() => setSnippetPanelOpen(false)}
        />
      </div>
    </div>
  )
}
