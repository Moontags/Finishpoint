import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',        // Only look for tests in tests/
  testMatch: '**/*.spec.ts', // Only .spec.ts files
  use: {
    baseURL: 'http://localhost:3000',
  },
  // ... other settings as needed
});
