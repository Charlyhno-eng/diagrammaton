import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 120_000,
  fullyParallel: false,
  forbidOnly: true,
  reporter: [['list']],
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01 } },
  use: {
    baseURL: 'http://127.0.0.1:4173',
    viewport: { width: 1600, height: 1000 },
    colorScheme: 'dark',
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    launchOptions: { executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] },
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173/health',
    reuseExistingServer: true,
    timeout: 30_000,
  },
})
