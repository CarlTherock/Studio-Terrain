import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: 'http://localhost:4173/Studio-Terrain/',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'pnpm run preview -- --port 4173',
    url: 'http://localhost:4173/Studio-Terrain/',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
