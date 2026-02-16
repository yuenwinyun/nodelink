import * as net from 'net'
import { shell } from 'electron'
import { getSessionClient } from './ssh'
import type { TunnelConfig } from '../shared/types'

interface ActiveTunnel {
  config: TunnelConfig
  server: net.Server
  connections: Set<net.Socket>
}

// Map<sessionId, Map<tunnelId, ActiveTunnel>>
const activeTunnels = new Map<string, Map<string, ActiveTunnel>>()

/**
 * Start a local port-forwarding tunnel through the SSH session.
 * Creates a TCP server on localhost:{localPort} that forwards every
 * connection through the SSH client's forwardOut to remoteHost:remotePort.
 */
export function tunnelStart(
  sessionId: string,
  config: TunnelConfig
): Promise<{ tunnelId: string; localPort: number }> {
  return new Promise((resolve, reject) => {
    const client = getSessionClient(sessionId)
    if (!client) {
      reject(new Error('SSH session not found or not connected'))
      return
    }

    // Check if this tunnel is already running for this session
    const sessionTunnels = activeTunnels.get(sessionId)
    if (sessionTunnels?.has(config.id)) {
      reject(new Error(`Tunnel "${config.name}" is already running`))
      return
    }

    const connections = new Set<net.Socket>()

    const server = net.createServer((localSocket) => {
      connections.add(localSocket)

      client.forwardOut(
        '127.0.0.1',
        config.localPort,
        config.remoteHost,
        config.remotePort,
        (err, sshStream) => {
          if (err) {
            localSocket.end()
            connections.delete(localSocket)
            return
          }

          // Bidirectional pipe
          localSocket.pipe(sshStream)
          sshStream.pipe(localSocket)

          sshStream.on('close', () => {
            localSocket.end()
            connections.delete(localSocket)
          })

          localSocket.on('close', () => {
            sshStream.end()
            connections.delete(localSocket)
          })

          localSocket.on('error', () => {
            sshStream.end()
            connections.delete(localSocket)
          })

          sshStream.on('error', () => {
            localSocket.end()
            connections.delete(localSocket)
          })
        }
      )
    })

    server.on('error', (err) => {
      reject(err)
    })

    server.listen(config.localPort, '127.0.0.1', () => {
      // Store the active tunnel
      if (!activeTunnels.has(sessionId)) {
        activeTunnels.set(sessionId, new Map())
      }
      activeTunnels.get(sessionId)!.set(config.id, { config, server, connections })

      resolve({ tunnelId: config.id, localPort: config.localPort })
    })
  })
}

/** Stop a specific tunnel */
export function tunnelStop(sessionId: string, tunnelId: string): boolean {
  const sessionTunnels = activeTunnels.get(sessionId)
  if (!sessionTunnels) return false

  const tunnel = sessionTunnels.get(tunnelId)
  if (!tunnel) return false

  // Close all active connections
  for (const socket of tunnel.connections) {
    socket.destroy()
  }
  tunnel.connections.clear()

  // Close the TCP server
  tunnel.server.close()
  sessionTunnels.delete(tunnelId)

  // Clean up empty session entry
  if (sessionTunnels.size === 0) {
    activeTunnels.delete(sessionId)
  }

  return true
}

/** Stop all tunnels for a session (called on SSH disconnect) */
export function tunnelStopAll(sessionId: string): void {
  const sessionTunnels = activeTunnels.get(sessionId)
  if (!sessionTunnels) return

  for (const [tunnelId] of sessionTunnels) {
    tunnelStop(sessionId, tunnelId)
  }
}

/** Get the list of active tunnel IDs for a session */
export function getActiveTunnels(
  sessionId: string
): Array<{ tunnelId: string; localPort: number; name: string }> {
  const sessionTunnels = activeTunnels.get(sessionId)
  if (!sessionTunnels) return []

  return Array.from(sessionTunnels.values()).map((t) => ({
    tunnelId: t.config.id,
    localPort: t.config.localPort,
    name: t.config.name
  }))
}

/** Open the tunnelled URL in the system default browser */
export function tunnelOpenBrowser(localPort: number): void {
  shell.openExternal(`http://localhost:${localPort}`)
}
