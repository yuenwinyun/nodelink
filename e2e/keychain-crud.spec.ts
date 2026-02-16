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

test.describe('Keychain CRUD', () => {
  test('switch to keychain tab', async () => {
    const keychainTab = page.getByRole('tab', { name: 'Keychain' })
    await keychainTab.click()

    await expect(page.getByText('No keychain entries yet')).toBeVisible()
  })

  test('create a password keychain entry', async () => {
    const addBtn = page.locator('button', { hasText: '+ Add Keychain Entry' })
    await addBtn.click()

    const heading = page.locator('h2', { hasText: 'New Keychain Entry' })
    await expect(heading).toBeVisible()

    await page.fill('#kc-label', 'Dev Credentials')
    await page.fill('#kc-username', 'devuser')
    await page.fill('#kc-password', 'secret123')

    await page.locator('button[type="submit"]', { hasText: 'Create' }).click()

    await expect(page.getByText('Dev Credentials', { exact: true })).toBeVisible()
  })

  test('create an SSH key keychain entry', async () => {
    const addBtn = page.locator('button', { hasText: '+ Add Keychain Entry' })
    await addBtn.click()

    await page.fill('#kc-label', 'SSH Key Creds')
    await page.fill('#kc-username', 'sshuser')

    // Click the SSH Key radio label
    const sshKeyLabel = page.locator('label.label', { hasText: 'SSH Key' })
    await sshKeyLabel.click()

    // Wait for textarea to appear
    await page.waitForSelector('#kc-sshkey')

    await page.fill('#kc-sshkey', '-----BEGIN OPENSSH PRIVATE KEY-----\ntest-key-content\n-----END OPENSSH PRIVATE KEY-----')

    await page.locator('button[type="submit"]', { hasText: 'Create' }).click()

    await expect(page.getByText('SSH Key Creds', { exact: true })).toBeVisible()
  })

  test('edit a keychain entry', async () => {
    const entryButton = page.locator('.menu button', { hasText: 'Dev Credentials' })
    await entryButton.click()

    const heading = page.locator('h2', { hasText: 'Edit Keychain Entry' })
    await expect(heading).toBeVisible()

    await page.fill('#kc-label', 'Production Credentials')

    await page.locator('button[type="submit"]', { hasText: 'Save' }).click()

    await expect(page.getByText('Production Credentials', { exact: true })).toBeVisible()
  })

  test('keychain form validation shows errors', async () => {
    const addBtn = page.locator('button', { hasText: '+ Add Keychain Entry' })
    await addBtn.click()

    await page.locator('button[type="submit"]', { hasText: 'Create' }).click()

    await expect(page.getByText('Label is required', { exact: true })).toBeVisible()
    await expect(page.getByText('Username is required', { exact: true })).toBeVisible()
    await expect(page.getByText('Password is required', { exact: true })).toBeVisible()

    await page.locator('button', { hasText: 'Cancel' }).click()
  })

  test('toggle password visibility', async () => {
    const addBtn = page.locator('button', { hasText: '+ Add Keychain Entry' })
    await addBtn.click()

    await page.fill('#kc-password', 'mysecret')

    const passwordInput = page.locator('#kc-password')
    await expect(passwordInput).toHaveAttribute('type', 'password')

    await page.getByRole('button', { name: 'Toggle password visibility' }).click()
    await expect(passwordInput).toHaveAttribute('type', 'text')

    await page.getByRole('button', { name: 'Toggle password visibility' }).click()
    await expect(passwordInput).toHaveAttribute('type', 'password')

    await page.locator('button', { hasText: 'Cancel' }).click()
  })

  test('delete a keychain entry', async () => {
    await expect(page.getByText('Production Credentials', { exact: true })).toBeVisible()

    const entryButton = page.locator('.menu button', { hasText: 'Production Credentials' })
    await entryButton.click({ button: 'right' })

    await page.locator('[role="menuitem"]', { hasText: 'Delete' }).click()

    await page.locator('button.btn-error', { hasText: 'Delete' }).click()

    await expect(page.getByText('Production Credentials', { exact: true })).not.toBeVisible()
  })
})
