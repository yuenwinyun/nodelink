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
  deleteKeychainEntry
} from './store'
import { sshConnect, sshInput, sshResize, sshDisconnect, sshDisconnectAll } from './ssh'

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

  // SSH
  ipcMain.handle('ssh:connect', (_, sessionId, config) => sshConnect(sessionId, config))
  ipcMain.on('ssh:input', (_, sessionId, data) => sshInput(sessionId, data))
  ipcMain.on('ssh:resize', (_, sessionId, cols, rows) => sshResize(sessionId, cols, rows))
  ipcMain.on('ssh:disconnect', (_, sessionId) => sshDisconnect(sessionId))
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
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
