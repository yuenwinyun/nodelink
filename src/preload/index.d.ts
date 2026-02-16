import { ElectronAPI } from '@electron-toolkit/preload'
import type { Host, KeychainEntry, Snippet, TunnelConfig } from '../shared/types'

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

  getSnippets(): Promise<Snippet[]>
  createSnippet(input: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>): Promise<Snippet>
  updateSnippet(
    id: string,
    input: Partial<Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Snippet | null>
  deleteSnippet(id: string): Promise<boolean>

  sshConnect(
    sessionId: string,
    config: { host: string; port: number; username: string; password?: string; privateKey?: string }
  ): Promise<void>
  sshInput(sessionId: string, data: string): void
  sshResize(sessionId: string, cols: number, rows: number): void
  sshDisconnect(sessionId: string): void
  onSshData(callback: (sessionId: string, data: string) => void): () => void
  onSshClosed(callback: (sessionId: string) => void): () => void

  ptySpawn(sessionId: string): Promise<void>
  ptyInput(sessionId: string, data: string): void
  ptyResize(sessionId: string, cols: number, rows: number): void
  ptyKill(sessionId: string): void
  onPtyData(callback: (sessionId: string, data: string) => void): () => void
  onPtyExit(callback: (sessionId: string, exitCode: number) => void): () => void

  tunnelStart(
    sessionId: string,
    config: TunnelConfig
  ): Promise<{ tunnelId: string; localPort: number }>
  tunnelStop(sessionId: string, tunnelId: string): Promise<boolean>
  tunnelStopAll(sessionId: string): Promise<void>
  getActiveTunnels(
    sessionId: string
  ): Promise<Array<{ tunnelId: string; localPort: number; name: string }>>
  tunnelOpenBrowser(localPort: number): Promise<void>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}
