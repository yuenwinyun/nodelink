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

test.describe('Host CRUD', () => {
  test('create a new host', async () => {
    const addBtn = page.locator('button', { hasText: '+ Add Host' })
    await addBtn.click()

    const heading = page.locator('h2', { hasText: 'New Host' })
    await expect(heading).toBeVisible()

    await page.fill('#host-name', 'Test Server')
    await page.fill('#host-address', '192.168.1.100')
    await page.fill('#host-port', '2222')
    await page.fill('#host-username', 'testuser')

    await page.locator('button[type="submit"]', { hasText: 'Create' }).click()

    await expect(page.getByText('Test Server', { exact: true })).toBeVisible()
    await expect(page.getByText('testuser@192.168.1.100:2222')).toBeVisible()
  })

  test('select a host and edit it', async () => {
    const hostButton = page.locator('.menu button', { hasText: 'Test Server' })
    await hostButton.click()

    const heading = page.locator('h2', { hasText: 'Edit Host' })
    await expect(heading).toBeVisible()

    await page.fill('#host-name', 'Updated Server')

    await page.locator('button[type="submit"]', { hasText: 'Save' }).click()

    await expect(page.getByText('Updated Server', { exact: true })).toBeVisible()
  })

  test('host form validation shows errors', async () => {
    const addBtn = page.locator('button', { hasText: '+ Add Host' })
    await addBtn.click()

    await page.fill('#host-name', '')
    await page.fill('#host-address', '')
    await page.fill('#host-username', '')

    await page.locator('button[type="submit"]', { hasText: 'Create' }).click()

    await expect(page.getByText('Name is required', { exact: true })).toBeVisible()
    await expect(page.getByText('Address is required', { exact: true })).toBeVisible()
    await expect(page.getByText('Username is required', { exact: true })).toBeVisible()

    await page.locator('button', { hasText: 'Cancel' }).click()
  })

  test('delete a host', async () => {
    await expect(page.getByText('Updated Server', { exact: true })).toBeVisible()

    const hostButton = page.locator('.menu button', { hasText: 'Updated Server' })
    await hostButton.click({ button: 'right' })

    await page.locator('[role="menuitem"]', { hasText: 'Delete' }).click()

    // Click the confirm delete button (btn-error class distinguishes it from Cancel)
    await page.locator('button.btn-error', { hasText: 'Delete' }).click()

    await expect(page.getByText('Updated Server', { exact: true })).not.toBeVisible()
  })
})
