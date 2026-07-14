import { test, expect } from '@playwright/test';

import customers from '../mocks/customers.json'

test.describe('EngageSphere', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/customers*', async (route) => {
      expect(route.request().method()).toBe('GET')
      await route.fulfill({ json: customers })
    })
    await page.goto('/')
  })

  test('shows the mocked customer', async ({ page }) => {
    await expect(page.getByRole('table')).toBeVisible()
    await expect(page.getByText('SpaceY Inc.')).toBeVisible()
  })
})
