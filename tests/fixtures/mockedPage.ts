import { test as base, expect } from '@playwright/test'
import customers from '../../mocks/customers.json'

export const test = base.extend<{ mockedPage: import('@playwright/test').Page }>({
  mockedPage: async ({ page }, use) => {
    await page.route('**/customers*', async (route) => {
      await route.fulfill({ json: customers })
    })
    await page.goto('/')
    await use(page)
  },
})

export { expect }
