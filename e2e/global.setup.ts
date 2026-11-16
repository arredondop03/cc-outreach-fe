import { execFileSync } from 'node:child_process'
import { expect, test as setup } from '@playwright/test'

import { seedCompanies } from './seed-companies.ts'
import { backendDir, backendEnv } from '../playwright.config.ts'

const run = (args: string[]) =>
  execFileSync('npx', args, {
    cwd: backendDir,
    env: { ...process.env, ...backendEnv },
    stdio: 'pipe',
  })

setup('reset database and log in', async ({ page }) => {
  await setup.step('reset test database', () => {
    run(['prisma', 'migrate', 'reset', '--force'])
    run(['tsx', 'scripts/seed-admin.ts'])
  })

  await setup.step('log in as admin', async () => {
    await page.goto('/login')
    await page.getByLabel('Email').fill(backendEnv.ADMIN_EMAIL)
    await page.getByLabel('Password').fill(backendEnv.ADMIN_PASSWORD)
    await page.getByRole('button', { name: 'Log in' }).click()
    await expect(page.getByRole('heading', { name: 'Today' })).toBeVisible()
    await page.context().storageState({ path: 'playwright/.auth/user.json' })
  })

  await setup.step('seed companies', async () => {
    for (const company of Object.values(seedCompanies)) {
      const response = await page.request.post(`${backendEnv.BETTER_AUTH_URL}/companies`, {
        data: {
          ...company,
          linkedinUrl: `https://www.linkedin.com/company/${company.domain}`,
        },
      })
      expect(response.status(), `seeding ${company.name}`).toBe(201)
    }
  })
})
