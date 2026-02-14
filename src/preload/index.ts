import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { Host, KeychainEntry } from '../shared/types'

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
  }
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
