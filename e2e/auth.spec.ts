import { expect, test } from '@playwright/test'

test('session survives a reload on a protected page', async ({ page }) => {
  await page.goto('/companies')
  await page.reload()
  await expect(page).toHaveURL('/companies')
  await expect(page.getByRole('heading', { name: 'Companies' })).toBeVisible()
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
