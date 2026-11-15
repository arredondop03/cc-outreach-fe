import { existsSync } from 'node:fs'
import { defineConfig, devices } from '@playwright/test'

// Test-only secrets live in .env.test (git-ignored). Copy .env.test.example to create it.
if (existsSync('.env.test')) process.loadEnvFile('.env.test')

const required = ['TEST_DATABASE_URL', 'TEST_AUTH_SECRET', 'TEST_ADMIN_EMAIL', 'TEST_ADMIN_PASSWORD']
const missing = required.filter((key) => !process.env[key])
if (missing.length) throw new Error(`Missing in .env.test: ${missing.join(', ')}`)

// Safety guard: the setup project wipes this database, so refuse anything but a local *_test DB.
const dbUrl = new URL(process.env.TEST_DATABASE_URL!)
if (!['localhost', '127.0.0.1'].includes(dbUrl.hostname) || !dbUrl.pathname.endsWith('_test')) {
  throw new Error('TEST_DATABASE_URL must point to a local database whose name ends in "_test"')
}

const API_URL = 'http://localhost:3001'
const APP_URL = 'http://localhost:5174'

export const backendDir = '../cc-outreach-be'
export const backendEnv = {
  NODE_ENV: 'test',
  PORT: '3001',
  LOG_LEVEL: 'warn',
  DATABASE_URL: process.env.TEST_DATABASE_URL!,
  BETTER_AUTH_SECRET: process.env.TEST_AUTH_SECRET!,
  BETTER_AUTH_URL: API_URL,
  FRONTEND_ORIGIN: APP_URL,
  ADMIN_EMAIL: process.env.TEST_ADMIN_EMAIL!,
  ADMIN_PASSWORD: process.env.TEST_ADMIN_PASSWORD!,
}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['github']] : 'html',
  use: {
    baseURL: APP_URL,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/user.json' },
      dependencies: ['setup'],
    },
  ],
  // Dedicated ports (3001/5174) so tests never reuse the dev servers or the dev database.
  webServer: [
    {
      name: 'backend',
      // migrate deploy creates the test DB on first run so the server's startup check passes.
      command: 'npx prisma migrate deploy && npx tsx src/index.ts',
      cwd: backendDir,
      url: `${API_URL}/api/auth/ok`,
      env: backendEnv,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      name: 'frontend',
      command: 'npx vite --port 5174 --strictPort',
      url: APP_URL,
      env: { VITE_API_URL: API_URL },
      reuseExistingServer: !process.env.CI,
    },
  ],
})
