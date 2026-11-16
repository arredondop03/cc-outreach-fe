import { expect, test } from '@playwright/test'

test('companies page shows search, filter and table', async ({ page }) => {
  await page.goto('/companies')
  await expect(page.getByRole('heading', { name: 'Companies' })).toBeVisible()
  await expect(page.getByLabel('Search companies')).toBeVisible()
  await expect(page.getByRole('table')).toBeVisible()
})

test('shows an empty state when nothing matches the search', async ({ page }) => {
  await page.goto('/companies')
  await page.getByLabel('Search companies').fill('zzz-no-such-company')
  await expect(page.getByText('No companies match.')).toBeVisible()
})
