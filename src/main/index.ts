import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import {
  getHosts,
  createHost,
  updateHost,
  deleteHost,
  getKeychain,
  createKeychainEntry,
  updateKeychainEntry,
  deleteKeychainEntry,
  getSnippets,
  createSnippet,
  updateSnippet,
  deleteSnippet
} from './store'
import { sshConnect, sshInput, sshResize, sshDisconnect, sshDisconnectAll } from './ssh'
import { ptySpawn, ptyInput, ptyResize, ptyKill, ptyKillAll } from './pty'
import { tunnelStart, tunnelStop, tunnelStopAll, getActiveTunnels, tunnelOpenBrowser } from './tunnel'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1100,
    height: 700,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' || process.platform === 'win32' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function registerIpcHandlers(): void {
  // Hosts
  ipcMain.handle('hosts:getAll', () => getHosts())
  ipcMain.handle('hosts:create', (_, input) => createHost(input))
  ipcMain.handle('hosts:update', (_, id, input) => updateHost(id, input))
  ipcMain.handle('hosts:delete', (_, id) => deleteHost(id))

  // Keychain
  ipcMain.handle('keychain:getAll', () => getKeychain())
  ipcMain.handle('keychain:create', (_, input) => createKeychainEntry(input))
  ipcMain.handle('keychain:update', (_, id, input) => updateKeychainEntry(id, input))
  ipcMain.handle('keychain:delete', (_, id) => deleteKeychainEntry(id))

  // Snippets
  ipcMain.handle('snippets:getAll', () => getSnippets())
  ipcMain.handle('snippets:create', (_, input) => createSnippet(input))
  ipcMain.handle('snippets:update', (_, id, input) => updateSnippet(id, input))
  ipcMain.handle('snippets:delete', (_, id) => deleteSnippet(id))

  // SSH
  ipcMain.handle('ssh:connect', (_, sessionId, config) => sshConnect(sessionId, config))
  ipcMain.on('ssh:input', (_, sessionId, data) => sshInput(sessionId, data))
  ipcMain.on('ssh:resize', (_, sessionId, cols, rows) => sshResize(sessionId, cols, rows))
  ipcMain.on('ssh:disconnect', (_, sessionId) => sshDisconnect(sessionId))

  // Local PTY
  ipcMain.handle('pty:spawn', (_, sessionId) => ptySpawn(sessionId))
  ipcMain.on('pty:input', (_, sessionId, data) => ptyInput(sessionId, data))
  ipcMain.on('pty:resize', (_, sessionId, cols, rows) => ptyResize(sessionId, cols, rows))
  ipcMain.on('pty:kill', (_, sessionId) => ptyKill(sessionId))

  // Tunnels
  ipcMain.handle('tunnel:start', (_, sessionId, config) => tunnelStart(sessionId, config))
  ipcMain.handle('tunnel:stop', (_, sessionId, tunnelId) => tunnelStop(sessionId, tunnelId))
  ipcMain.handle('tunnel:stopAll', (_, sessionId) => tunnelStopAll(sessionId))
  ipcMain.handle('tunnel:getActive', (_, sessionId) => getActiveTunnels(sessionId))
  ipcMain.handle('tunnel:openBrowser', (_, localPort) => tunnelOpenBrowser(localPort))
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  registerIpcHandlers()
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('before-quit', () => {
  sshDisconnectAll()
  ptyKillAll()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
