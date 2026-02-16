import type * as ptyTypes from 'node-pty'
import { BrowserWindow } from 'electron'
import * as os from 'os'

let pty: typeof import('node-pty') | undefined

function getPty(): typeof import('node-pty') {
  if (!pty) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    pty = require('node-pty')
  }
  return pty!
}

const ptys = new Map<string, ptyTypes.IPty>()

function getMainWindow(): BrowserWindow | null {
  const windows = BrowserWindow.getAllWindows()
  return windows[0] ?? null
}

function getDefaultShell(): string {
  if (process.platform === 'win32') {
    return process.env.COMSPEC || 'powershell.exe'
  }
  return process.env.SHELL || '/bin/zsh'
}

export function ptySpawn(sessionId: string): void {
  const shell = getDefaultShell()
  const cwd = os.homedir()

  const proc = getPty().spawn(shell, [], {
    name: 'xterm-256color',
    cols: 80,
    rows: 24,
    cwd,
    env: process.env as Record<string, string>
  })

  ptys.set(sessionId, proc)

  proc.onData((data) => {
    const win = getMainWindow()
    if (win && !win.isDestroyed()) {
      win.webContents.send('pty:data', sessionId, data)
    }
  })

  proc.onExit(({ exitCode }) => {
    ptys.delete(sessionId)
    const win = getMainWindow()
    if (win && !win.isDestroyed()) {
      win.webContents.send('pty:exit', sessionId, exitCode)
    }
  })
}

export function ptyInput(sessionId: string, data: string): void {
  const proc = ptys.get(sessionId)
  if (proc) {
    proc.write(data)
  }
}

export function ptyResize(sessionId: string, cols: number, rows: number): void {
  const proc = ptys.get(sessionId)
  if (proc) {
    proc.resize(cols, rows)
  }
}

export function ptyKill(sessionId: string): void {
  const proc = ptys.get(sessionId)
  if (proc) {
    proc.kill()
    ptys.delete(sessionId)
  }
}

export function ptyKillAll(): void {
  for (const [id] of ptys) {
    ptyKill(id)
  }
}
