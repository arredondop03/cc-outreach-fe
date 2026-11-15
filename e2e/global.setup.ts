import { execFileSync } from 'node:child_process'
import { expect, test as setup } from '@playwright/test'

import { backendDir, backendEnv } from '../playwright.config.ts'

const run = (args: string[]) =>
  execFileSync('npx', args, { cwd: backendDir, env: { ...process.env, ...backendEnv }, stdio: 'pipe' })

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
})
