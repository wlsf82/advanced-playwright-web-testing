import { test, expect } from '@playwright/test';

test.describe('EngageSphere', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/customers*', async (route) => {
      console.log('Request URL:', route.request().url())
      expect(route.request().method()).toBe('GET')
      await route.continue()
    })
    await page.goto('/')
  })

  test('loads the customers table', async ({ page }) => {
    await expect(page.getByRole('table')).toBeVisible()
  })
})
