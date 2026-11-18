import { expect, test } from '@playwright/test'

import { seedCompanies } from './seed-companies.ts'

const { ready } = seedCompanies

// Filtering, search and empty states are unit-tested in src/pages/CompaniesPage.test.tsx.
test.describe('companies list', () => {
  test('lists a company from the real backend with its role and status', async ({ page }) => {
    await page.goto('/companies')
    const row = page.getByRole('row', { name: ready.name })
    await expect(row).toContainText(ready.domain)
    await expect(row).toContainText(ready.role)
    await expect(row).toContainText('ready for sequence')
  })
})
