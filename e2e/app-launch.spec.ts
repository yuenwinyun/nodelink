import { test, expect } from '@playwright/test'
import { launchApp, cleanUpData } from './helpers'
import type { ElectronApplication, Page } from '@playwright/test'

let app: ElectronApplication
let page: Page

test.beforeAll(async () => {
  ;({ app, page } = await launchApp())
})

test.afterAll(async () => {
  await cleanUpData()
  await app.close()
})

test('window opens with correct title', async () => {
  const title = await page.title()
  expect(title).toBeTruthy()
})

test('window has expected dimensions', async () => {
  const windowSize = await app.evaluate(async ({ BrowserWindow }) => {
    const [win] = BrowserWindow.getAllWindows()
    const [width, height] = win.getSize()
    return { width, height }
  })
  expect(windowSize.width).toBeGreaterThanOrEqual(1000)
  expect(windowSize.height).toBeGreaterThanOrEqual(600)
})

test('sidebar is visible with NodeLink branding', async () => {
  const heading = page.locator('h1', { hasText: 'NodeLink' })
  await expect(heading).toBeVisible()
})

test('shows welcome empty state', async () => {
  const welcome = page.locator('h2', { hasText: 'Welcome to NodeLink' })
  await expect(welcome).toBeVisible()
})

test('hosts and keychain tabs are present', async () => {
  const hostsTab = page.getByRole('tab', { name: 'Hosts' })
  const keychainTab = page.getByRole('tab', { name: 'Keychain' })
  await expect(hostsTab).toBeVisible()
  await expect(keychainTab).toBeVisible()
})
