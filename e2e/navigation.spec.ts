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

test.describe('Navigation & Sidebar', () => {
  test('default view shows hosts tab active', async () => {
    const hostsTab = page.getByRole('tab', { name: 'Hosts' })
    await expect(hostsTab).toHaveClass(/tab-active/)
  })

  test('switching to keychain tab shows keychain content', async () => {
    const keychainTab = page.getByRole('tab', { name: 'Keychain' })
    await keychainTab.click()

    await expect(keychainTab).toHaveClass(/tab-active/)
    const addBtn = page.locator('button', { hasText: '+ Add Keychain Entry' })
    await expect(addBtn).toBeVisible()
  })

  test('switching back to hosts tab', async () => {
    const hostsTab = page.getByRole('tab', { name: 'Hosts' })
    await hostsTab.click()

    await expect(hostsTab).toHaveClass(/tab-active/)
    const addBtn = page.locator('button', { hasText: '+ Add Host' })
    await expect(addBtn).toBeVisible()
  })

  test('empty state action button opens correct form', async () => {
    const emptyActionBtn = page.locator('main button', { hasText: 'Add Host' })
    if (await emptyActionBtn.isVisible()) {
      await emptyActionBtn.click()
      const heading = page.locator('h2', { hasText: 'New Host' })
      await expect(heading).toBeVisible()

      await page.locator('button', { hasText: 'Cancel' }).click()
    }
  })

  test('cancel button returns to empty state', async () => {
    const addBtn = page.locator('button', { hasText: '+ Add Host' })
    await addBtn.click()

    await expect(page.locator('h2', { hasText: 'New Host' })).toBeVisible()

    await page.locator('button', { hasText: 'Cancel' }).click()

    await expect(page.locator('h2', { hasText: 'Welcome to NodeLink' })).toBeVisible()
  })

  test('create host then verify it persists across tab switches', async () => {
    // Create a host
    await page.locator('button', { hasText: '+ Add Host' }).click()
    await page.fill('#host-name', 'Persistent Host')
    await page.fill('#host-address', '10.0.0.1')
    await page.fill('#host-username', 'admin')
    await page.locator('button[type="submit"]', { hasText: 'Create' }).click()

    await expect(page.getByText('Persistent Host', { exact: true })).toBeVisible()

    // Switch to keychain tab and back
    await page.getByRole('tab', { name: 'Keychain' }).click()
    await page.getByRole('tab', { name: 'Hosts' }).click()

    // Host should still be there
    await expect(page.getByText('Persistent Host', { exact: true })).toBeVisible()

    // Cleanup: delete the host
    const hostButton = page.locator('.menu button', { hasText: 'Persistent Host' })
    await hostButton.click({ button: 'right' })
    await page.locator('[role="menuitem"]', { hasText: 'Delete' }).click()
    await page.locator('button.btn-error', { hasText: 'Delete' }).click()
    await expect(page.getByText('Persistent Host', { exact: true })).not.toBeVisible()
  })
})
