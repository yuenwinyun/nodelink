import { Client, type ClientChannel } from 'ssh2'
import { BrowserWindow } from 'electron'

interface Session {
  client: Client
  stream: ClientChannel
}

const sessions = new Map<string, Session>()

function getMainWindow(): BrowserWindow | null {
  const windows = BrowserWindow.getAllWindows()
  return windows[0] ?? null
}

export function sshConnect(
  sessionId: string,
  config: {
    host: string
    port: number
    username: string
    password?: string
    privateKey?: string
  }
): Promise<void> {
  return new Promise((resolve, reject) => {
    const client = new Client()

    const timeout = setTimeout(() => {
      client.end()
      reject(new Error('Connection timed out (10s)'))
    }, 10000)

    client.on('ready', () => {
      clearTimeout(timeout)
      client.shell({ term: 'xterm-256color' }, (err, stream) => {
        if (err) {
          client.end()
          reject(err)
          return
        }

        sessions.set(sessionId, { client, stream })

        stream.on('data', (data: Buffer) => {
          const win = getMainWindow()
          if (win && !win.isDestroyed()) {
            win.webContents.send('ssh:data', sessionId, data.toString('utf-8'))
          }
        })

        stream.on('close', () => {
          sessions.delete(sessionId)
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

    client.connect({
      host: config.host,
      port: config.port,
      username: config.username,
      password: config.password,
      privateKey: config.privateKey,
      tryKeyboard: !!config.password,
      agent: useAgent ? process.env.SSH_AUTH_SOCK : undefined,
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
