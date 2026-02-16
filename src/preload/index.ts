import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { Host, KeychainEntry, Snippet, TunnelConfig } from '../shared/types'

const api = {
  // Hosts
  getHosts: (): Promise<Host[]> => ipcRenderer.invoke('hosts:getAll'),
  createHost: (input: Omit<Host, 'id' | 'createdAt' | 'updatedAt'>): Promise<Host> =>
    ipcRenderer.invoke('hosts:create', input),
  updateHost: (
    id: string,
    input: Partial<Omit<Host, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Host | null> => ipcRenderer.invoke('hosts:update', id, input),
  deleteHost: (id: string): Promise<boolean> => ipcRenderer.invoke('hosts:delete', id),

  // Keychain
  getKeychain: (): Promise<KeychainEntry[]> => ipcRenderer.invoke('keychain:getAll'),
  createKeychainEntry: (
    input: Omit<KeychainEntry, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<KeychainEntry> => ipcRenderer.invoke('keychain:create', input),
  updateKeychainEntry: (
    id: string,
    input: Partial<Omit<KeychainEntry, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<KeychainEntry | null> => ipcRenderer.invoke('keychain:update', id, input),
  deleteKeychainEntry: (id: string): Promise<boolean> =>
    ipcRenderer.invoke('keychain:delete', id),

  // Snippets
  getSnippets: (): Promise<Snippet[]> => ipcRenderer.invoke('snippets:getAll'),
  createSnippet: (input: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>): Promise<Snippet> =>
    ipcRenderer.invoke('snippets:create', input),
  updateSnippet: (
    id: string,
    input: Partial<Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Snippet | null> => ipcRenderer.invoke('snippets:update', id, input),
  deleteSnippet: (id: string): Promise<boolean> => ipcRenderer.invoke('snippets:delete', id),

  // SSH
  sshConnect: (
    sessionId: string,
    config: { host: string; port: number; username: string; password?: string; privateKey?: string }
  ): Promise<void> => ipcRenderer.invoke('ssh:connect', sessionId, config),
  sshInput: (sessionId: string, data: string): void =>
    ipcRenderer.send('ssh:input', sessionId, data),
  sshResize: (sessionId: string, cols: number, rows: number): void =>
    ipcRenderer.send('ssh:resize', sessionId, cols, rows),
  sshDisconnect: (sessionId: string): void => ipcRenderer.send('ssh:disconnect', sessionId),
  onSshData: (callback: (sessionId: string, data: string) => void): (() => void) => {
    const handler = (_: unknown, sessionId: string, data: string): void =>
      callback(sessionId, data)
    ipcRenderer.on('ssh:data', handler)
    return () => ipcRenderer.removeListener('ssh:data', handler)
  },
  onSshClosed: (callback: (sessionId: string) => void): (() => void) => {
    const handler = (_: unknown, sessionId: string): void => callback(sessionId)
    ipcRenderer.on('ssh:closed', handler)
    return () => ipcRenderer.removeListener('ssh:closed', handler)
  },

  // Local PTY
  ptySpawn: (sessionId: string): Promise<void> => ipcRenderer.invoke('pty:spawn', sessionId),
  ptyInput: (sessionId: string, data: string): void =>
    ipcRenderer.send('pty:input', sessionId, data),
  ptyResize: (sessionId: string, cols: number, rows: number): void =>
    ipcRenderer.send('pty:resize', sessionId, cols, rows),
  ptyKill: (sessionId: string): void => ipcRenderer.send('pty:kill', sessionId),
  onPtyData: (callback: (sessionId: string, data: string) => void): (() => void) => {
    const handler = (_: unknown, sessionId: string, data: string): void =>
      callback(sessionId, data)
    ipcRenderer.on('pty:data', handler)
    return () => ipcRenderer.removeListener('pty:data', handler)
  },
  onPtyExit: (callback: (sessionId: string, exitCode: number) => void): (() => void) => {
    const handler = (_: unknown, sessionId: string, exitCode: number): void =>
      callback(sessionId, exitCode)
    ipcRenderer.on('pty:exit', handler)
    return () => ipcRenderer.removeListener('pty:exit', handler)
  },

  // Tunnels
  tunnelStart: (
    sessionId: string,
    config: TunnelConfig
  ): Promise<{ tunnelId: string; localPort: number }> =>
    ipcRenderer.invoke('tunnel:start', sessionId, config),
  tunnelStop: (sessionId: string, tunnelId: string): Promise<boolean> =>
    ipcRenderer.invoke('tunnel:stop', sessionId, tunnelId),
  tunnelStopAll: (sessionId: string): Promise<void> =>
    ipcRenderer.invoke('tunnel:stopAll', sessionId),
  getActiveTunnels: (
    sessionId: string
  ): Promise<Array<{ tunnelId: string; localPort: number; name: string }>> =>
    ipcRenderer.invoke('tunnel:getActive', sessionId),
  tunnelOpenBrowser: (localPort: number): Promise<void> =>
    ipcRenderer.invoke('tunnel:openBrowser', localPort)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
