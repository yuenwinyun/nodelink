import { _electron as electron, type ElectronApplication, type Page } from '@playwright/test'
import { existsSync, writeFileSync, unlinkSync } from 'fs'
import { join } from 'path'

let cachedUserDataDir: string | null = null

export async function launchApp(): Promise<{ app: ElectronApplication; page: Page }> {
  const app = await electron.launch({
    args: [
      join(__dirname, '../out/main/index.js'),
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage'
    ],
    env: {
      ...process.env,
      NODE_ENV: 'production'
    }
  })

  // Get the userData path for cleanup
  cachedUserDataDir = await app.evaluate(async ({ app: electronApp }) => {
    return electronApp.getPath('userData')
  })

  const page = await app.firstWindow()
  await page.waitForLoadState('domcontentloaded')
  return { app, page }
}

export async function cleanUpData(): Promise<void> {
  if (!cachedUserDataDir) return
  const dataPath = join(cachedUserDataDir, 'data.json')
  if (existsSync(dataPath)) {
    unlinkSync(dataPath)
  }
}

export async function seedData(data: { hosts?: unknown[]; keychain?: unknown[] }): Promise<void> {
  if (!cachedUserDataDir) return
  const dataPath = join(cachedUserDataDir, 'data.json')
  writeFileSync(dataPath, JSON.stringify({ hosts: [], keychain: [], ...data }, null, 2))
}
