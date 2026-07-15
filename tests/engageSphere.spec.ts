import { test, expect } from '@playwright/test';

import customers from '../mocks/customers.json'
import smallCustomers from '../mocks/smallCustomer.json'
import techCustomer from '../mocks/techCustomer.json'

test.describe('EngageSphere', () => {
  test('shows the mocked customer', async ({ page }) => {
    await page.route('**/customers*', async (route) => {
      expect(route.request().method()).toBe('GET')
      await route.fulfill({ json: customers })
    })

    await page.goto('/')

    await expect(page.getByRole('table')).toBeVisible()
    await expect(page.getByText('SpaceY Inc.')).toBeVisible()
  })

  test('shows the empty state when there are no customers', async ({ page }) => {
    await page.route('**/customers*', async (route) => {
      await route.fulfill({
        json: {
          customers: [],
          pageInfo: {
            currentPage: 1,
            totalPages: 1,
            totalCustomers: 0
          }
        },
      })
    })

    await page.goto('/')

    await expect(page.locator('svg[title="image of an empty box"]')).toBeVisible()
    await expect(page.getByText('No customers available.')).toBeVisible()
    await expect(page.getByTestId('name')).toBeDisabled()
    await expect(page.getByRole('button', { name: 'Download CSV' })).toHaveCount(0)
  })

  test('shows the loading state', async ({ page }) => {
    await page.route('**/customers*', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await route.fulfill({ json: customers })
    })

    await page.goto('/')

    await expect(page.getByText('Loading...')).toBeVisible()
    await expect(page.getByRole('table')).toBeVisible()
  })

  test('requests the selected size filter', async ({ page }) => {
    await page.route('**/customers*', async (route) => {
      await route.fulfill({ json: smallCustomers })
    })

    await page.goto('/')

    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/customers') && res.url().includes('size=Small')),
      page.getByTestId('size-filter').selectOption('Small'),
    ])

    expect(response.status()).toBe(200)
  })

  test('requests the selected industry filter', async ({ page }) => {
    await page.route('**/customers*', async (route) => {
      await route.fulfill({ json: techCustomer })
    })

    await page.goto('/')

    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/customers') && res.url().includes('industry=Technology')),
      page.getByTestId('industry-filter').selectOption('Technology'),
    ])

    expect(response.status()).toBe(200)
  })

  test('shows the empty state on a network failure', async ({ page }) => {
    await page.route('**/customers*', async (route) => {
      await route.abort()
    })

    await page.goto('/')

    await expect(page.locator('svg[title="image of an empty box"]')).toBeVisible()
    await expect(page.getByText('No customers available.')).toBeVisible()
  })
})
