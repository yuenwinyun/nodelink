import { ElectronAPI } from '@electron-toolkit/preload'
import type { Host, KeychainEntry } from '../shared/types'

interface Api {
  getHosts(): Promise<Host[]>
  createHost(input: Omit<Host, 'id' | 'createdAt' | 'updatedAt'>): Promise<Host>
  updateHost(
    id: string,
    input: Partial<Omit<Host, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Host | null>
  deleteHost(id: string): Promise<boolean>

  getKeychain(): Promise<KeychainEntry[]>
  createKeychainEntry(
    input: Omit<KeychainEntry, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<KeychainEntry>
  updateKeychainEntry(
    id: string,
    input: Partial<Omit<KeychainEntry, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<KeychainEntry | null>
  deleteKeychainEntry(id: string): Promise<boolean>

  sshConnect(
    sessionId: string,
    config: { host: string; port: number; username: string; password?: string; privateKey?: string }
  ): Promise<void>
  sshInput(sessionId: string, data: string): void
  sshResize(sessionId: string, cols: number, rows: number): void
  sshDisconnect(sessionId: string): void
  onSshData(callback: (sessionId: string, data: string) => void): () => void
  onSshClosed(callback: (sessionId: string) => void): () => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}
