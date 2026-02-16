import { Client, type ClientChannel } from 'ssh2'
import { BrowserWindow } from 'electron'
import { fork, type ChildProcess } from 'child_process'
import { join } from 'path'

interface Session {
  client: Client
  stream: ClientChannel
  proxy?: ChildProcess
}

const sessions = new Map<string, Session>()

function getMainWindow(): BrowserWindow | null {
  const windows = BrowserWindow.getAllWindows()
  return windows[0] ?? null
}

/**
 * Spawn a local TCP proxy to work around macOS blocking the Electron binary
 * from accessing local network devices (EHOSTUNREACH). A child `node` process
 * connects to the target and listens on localhost; Electron connects to localhost.
 */
function spawnTcpProxy(host: string, port: number): Promise<{ localPort: number; child: ChildProcess }> {
  return new Promise((resolve, reject) => {
    const scriptPath = join(__dirname, 'tcp-connect.js')
    const child = fork(scriptPath, [JSON.stringify({ host, port })], {
      stdio: ['ignore', 'ignore', 'ignore', 'ipc']
    })

    const timeout = setTimeout(() => {
      child.kill()
      reject(new Error('TCP proxy startup timed out'))
    }, 10000)

    child.on('message', (msg: { type: string; port?: number; message?: string }) => {
      if (msg.type === 'listening' && msg.port) {
        clearTimeout(timeout)
        resolve({ localPort: msg.port, child })
      } else if (msg.type === 'error') {
        clearTimeout(timeout)
        child.kill()
        reject(new Error(msg.message ?? 'TCP proxy failed'))
      }
    })

    child.on('error', (err) => {
      clearTimeout(timeout)
      reject(err)
    })

    child.on('exit', (code) => {
      clearTimeout(timeout)
      if (code !== 0 && code !== null) {
        reject(new Error(`TCP proxy exited with code ${code}`))
      }
    })
  })
}

export async function sshConnect(
  sessionId: string,
  config: {
    host: string
    port: number
    username: string
    password?: string
    privateKey?: string
  }
): Promise<void> {
  // Spawn local TCP proxy to bypass macOS network restrictions on Electron
  const { localPort, child: proxyChild } = await spawnTcpProxy(config.host, config.port)

  return new Promise((resolve, reject) => {
    const client = new Client()

    const timeout = setTimeout(() => {
      client.end()
      proxyChild.kill()
      reject(new Error('Connection timed out (10s)'))
    }, 10000)

    client.on('ready', () => {
      clearTimeout(timeout)
      client.shell({ term: 'xterm-256color' }, (err, stream) => {
        if (err) {
          client.end()
          proxyChild.kill()
          reject(err)
          return
        }

        sessions.set(sessionId, { client, stream, proxy: proxyChild })

        stream.on('data', (data: Buffer) => {
          const win = getMainWindow()
          if (win && !win.isDestroyed()) {
            win.webContents.send('ssh:data', sessionId, data.toString('utf-8'))
          }
        })

        stream.on('close', () => {
          sessions.delete(sessionId)
          proxyChild.kill()
          const win = getMainWindow()
          if (win && !win.isDestroyed()) {
            win.webContents.send('ssh:closed', sessionId)
          }
          client.end()
        })

        resolve()
      })
    })

    client.on('error', (err) => {
      clearTimeout(timeout)
      sessions.delete(sessionId)
      proxyChild.kill()
      reject(err)
    })

    // Use SSH agent as fallback when no explicit credentials are provided
    const useAgent = !config.password && !config.privateKey

    // Handle keyboard-interactive auth (many servers use this instead of 'password')
    if (config.password) {
      client.on('keyboard-interactive', (_name, _instructions, _lang, prompts, finish) => {
        // Respond to all prompts with the password (typically just one "Password:" prompt)
        finish(prompts.map(() => config.password!))
      })
    }

    // Connect to the local proxy instead of the remote host directly
    client.connect({
      host: '127.0.0.1',
      port: localPort,
      username: config.username,
      password: config.password,
      privateKey: config.privateKey,
      tryKeyboard: !!config.password,
      agent: useAgent ? process.env.SSH_AUTH_SOCK : undefined,
      readyTimeout: 20000,
      hostVerifier: () => true // auto-accept for mock scope
    })
  })
}

export function sshInput(sessionId: string, data: string): void {
  const session = sessions.get(sessionId)
  if (session) {
    session.stream.write(data)
  }
}

export function sshResize(sessionId: string, cols: number, rows: number): void {
  const session = sessions.get(sessionId)
  if (session) {
    session.stream.setWindow(rows, cols, 0, 0)
  }
}

export function sshDisconnect(sessionId: string): void {
  const session = sessions.get(sessionId)
  if (session) {
    session.stream.close()
    session.client.end()
    session.proxy?.kill()
    sessions.delete(sessionId)
  }
}

export function sshDisconnectAll(): void {
  for (const [id] of sessions) {
    sshDisconnect(id)
  }
}

/** Expose the SSH client for a session (used by tunnel module) */
export function getSessionClient(sessionId: string): Client | null {
  const session = sessions.get(sessionId)
  return session?.client ?? null
}
