import type { Host, KeychainEntry, Snippet } from '@shared/types'

export type Tab = 'hosts' | 'keychain' | 'snippets'

export type View =
  | { type: 'empty' }
  | { type: 'host-form'; host: Host | null }
  | { type: 'keychain-form'; entry: KeychainEntry | null }
  | { type: 'snippet-form'; snippet: Snippet | null }
  | { type: 'terminal'; host: Host; sessionId: string }
  | { type: 'local-terminal'; sessionId: string }

export interface ActiveTunnel {
  tunnelId: string
  localPort: number
  name: string
}

export interface SshConfig {
  host: string
  port: number
  username: string
  password?: string
  privateKey?: string
}

export function buildSshConfig(host: Host, keychain: KeychainEntry[]): SshConfig {
  const config: SshConfig = {
    host: host.address,
    port: host.port,
    username: host.username
  }

  const keychainEntry = host.keychainId
    ? keychain.find((k) => k.id === host.keychainId) ?? null
    : null

  if (keychainEntry) {
    if (keychainEntry.authType === 'key') {
      config.privateKey = keychainEntry.sshKey
    } else {
      config.password = keychainEntry.password
    }
  }

  return config
}
