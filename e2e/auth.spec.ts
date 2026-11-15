import { expect, test } from '@playwright/test'

test('logged-in user sees the app shell', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL('/today')
  await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible()
})

test.describe('logged out', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('protected page redirects to login', async ({ page }) => {
    await page.goto('/companies')
    await expect(page).toHaveURL('/login')
  })

  test('wrong password shows an error', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill(process.env.TEST_ADMIN_EMAIL!)
    await page.getByLabel('Password').fill('definitely-wrong-password')
    await page.getByRole('button', { name: 'Log in' }).click()
    await expect(page.getByText(/invalid email or password/i)).toBeVisible()
    await expect(page).toHaveURL('/login')
  })
})
