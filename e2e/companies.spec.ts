import { expect, test } from '@playwright/test'

import { seedCompanies } from './seed-companies.ts'

const { newCompany, ready, active, archived, specialCharacters, longName } = seedCompanies

test.describe('companies list', () => {
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

  test('shows name, domain, role and status for each company', async ({ page }) => {
    await page.goto('/companies')
    const row = page.getByRole('row', { name: new RegExp(ready.name) })
    await expect(row).toContainText(ready.domain)
    await expect(row).toContainText(ready.role)
    await expect(row).toContainText('ready for sequence')
  })

  test('search matches by name or domain and is case-insensitive', async ({ page }) => {
    await page.goto('/companies')
    await page.getByLabel('Search companies').fill(ready.domain.toUpperCase())
    await expect(page.getByRole('row', { name: new RegExp(ready.name) })).toBeVisible()
    await expect(page.getByRole('row', { name: new RegExp(newCompany.name) })).toBeHidden()

    await page.getByLabel('Search companies').fill(newCompany.name.toLowerCase())
    await expect(page.getByRole('row', { name: new RegExp(newCompany.name) })).toBeVisible()
  })

  test('company with special characters in its name renders as plain text', async ({ page }) => {
    await page.goto('/companies')
    await expect(page.getByRole('cell', { name: specialCharacters.name, exact: true })).toBeVisible()
    await expect(page.locator('td b')).toHaveCount(0)
  })

  test('very long names are listed without breaking the table', async ({ page }) => {
    await page.goto('/companies')
    await expect(page.getByRole('cell', { name: longName.name, exact: true })).toBeVisible()
  })

  test('archived companies are hidden by default and shown when the archived filter is on', async ({ page }) => {
    await page.goto('/companies')
    await expect(page.getByRole('row', { name: new RegExp(newCompany.name) })).toBeVisible()
    await expect(page.getByRole('row', { name: new RegExp(archived.name) })).toBeHidden()

    const archivedFilter = page.getByRole('group', { name: 'Status' }).getByRole('button', { name: 'archived' })
    await expect(archivedFilter).toHaveAttribute('aria-pressed', 'false')
    await archivedFilter.click()
    await expect(archivedFilter).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByRole('row', { name: new RegExp(archived.name) })).toBeVisible()
  })

  test('deselecting a status hides companies with that status', async ({ page }) => {
    await page.goto('/companies')
    await page.getByRole('group', { name: 'Status' }).getByRole('button', { name: 'active' }).click()
    await expect(page.getByRole('row', { name: new RegExp(active.name) })).toBeHidden()
    await expect(page.getByRole('row', { name: new RegExp(newCompany.name) })).toBeVisible()
  })

  test('deselecting every status shows the empty state', async ({ page }) => {
    await page.goto('/companies')
    const filters = page.getByRole('group', { name: 'Status' })
    for (const status of ['new', 'ready for sequence', 'active']) {
      await filters.getByRole('button', { name: status }).click()
    }
    await expect(page.getByText('No companies match.')).toBeVisible()
  })

  test('status filter and search combine', async ({ page }) => {
    await page.goto('/companies')
    await page.getByRole('group', { name: 'Status' }).getByRole('button', { name: 'archived' }).click()
    await page.getByLabel('Search companies').fill(archived.name)
    await expect(page.getByRole('row', { name: new RegExp(archived.name) })).toBeVisible()
    await expect(page.getByRole('row', { name: new RegExp(active.name) })).toBeHidden()
  })
})
