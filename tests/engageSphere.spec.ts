import { test, expect } from './fixtures/mockedPage'
import fs from 'fs'

import { customersPage } from '../page-objects/customersPage'

import customers from '../mocks/customers.json'
import smallCustomers from '../mocks/smallCustomer.json'
import techCustomer from '../mocks/techCustomer.json'
import { csvSample } from '../mocks/sampleCsv'

test.describe('EngageSphere', () => {
  test.beforeEach(async ({ context, baseURL }) => {
    await context.addCookies([
      { name: 'cookieConsent', value: 'accepted', url: baseURL },
    ])
  })

  test('shows the mocked customer', async ({ mockedPage }) => {
    const engageSphere = customersPage(mockedPage)

    await expect(engageSphere.table).toBeVisible()
    await expect(engageSphere.customerNamed('SpaceY Inc.')).toBeVisible()
  })

  test('shows the empty state when there are no customers', async ({ page }) => {
    const engageSphere = customersPage(page)

    await page.route('**/customers*', async (route) => {
      await route.fulfill({
        json: {
          customers: [],
          pageInfo: {
            currentPage: 1,
            totalPages: 1,
            totalCustomers: 0,
          },
        },
      })
    })

    await engageSphere.open()

    await expect(engageSphere.emptyStateImage).toBeVisible()
    await expect(engageSphere.emptyStateMessage).toBeVisible()
    await expect(engageSphere.nameInput).toBeDisabled()
    await expect(engageSphere.downloadCsvButton).toHaveCount(0)
  })

  test('shows the loading state', async ({ page }) => {
    const engageSphere = customersPage(page)

    await page.route('**/customers*', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await route.fulfill({ json: customers })
    })

    await engageSphere.open()

    await expect(engageSphere.loading).toBeVisible()
    await expect(engageSphere.table).toBeVisible()
  })

  test('requests the selected size filter', async ({ page }) => {
    const engageSphere = customersPage(page)

    await page.route('**/customers*', async (route) => {
      await route.fulfill({ json: smallCustomers })
    })

    await engageSphere.open()

    const [response] = await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes('/customers') && res.url().includes('size=Small'),
      ),
      engageSphere.filterBySize('Small'),
    ])

    expect(response.status()).toBe(200)
  })

  test('requests the selected industry filter', async ({ page }) => {
    const engageSphere = customersPage(page)

    await page.route('**/customers*', async (route) => {
      await route.fulfill({ json: techCustomer })
    })

    await engageSphere.open()

    const [response] = await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes('/customers') && res.url().includes('industry=Technology'),
      ),
      engageSphere.filterByIndustry('Technology'),
    ])

    expect(response.status()).toBe(200)
  })

  test('shows the empty state on a network failure', async ({ page }) => {
    const engageSphere = customersPage(page)

    await page.route('**/customers*', async (route) => {
      await route.abort()
    })

    await engageSphere.open()

    await expect(engageSphere.emptyStateImage).toBeVisible()
    await expect(engageSphere.emptyStateMessage).toBeVisible()
  })

  test('persists the selected theme', async ({ mockedPage }) => {
    const engageSphere = customersPage(mockedPage)

    // Switch to dark mode (the half-moon toggle below the heading).
    await engageSphere.switchToDarkMode()

    expect(await engageSphere.readLocalStorage('theme')).toBe('dark')

    await engageSphere.reload()

    expect(await engageSphere.readLocalStorage('theme')).toBe('dark')
  })

  test('persists the selected pagination limit', async ({ mockedPage }) => {
    const engageSphere = customersPage(mockedPage)

    await engageSphere.setPaginationLimit('20')

    expect(await engageSphere.readLocalStorage('paginationLimit')).toBe('20')

    await engageSphere.reload()

    expect(await engageSphere.readLocalStorage('paginationLimit')).toBe('20')
  })

  test('stores the accepted consent as a cookie', async ({ mockedPage, context }) => {
    const engageSphere = customersPage(mockedPage)

    await context.clearCookies()
    await engageSphere.open()

    await engageSphere.acceptCookies()

    const cookies = await context.cookies()
    const consent = cookies.find((c) => c.name === 'cookieConsent')
    expect(consent?.value).toBe('accepted')
  })

  test('stores the declined consent as a cookie', async ({ mockedPage, context }) => {
    const engageSphere = customersPage(mockedPage)

    await context.clearCookies()
    await engageSphere.open()

    await engageSphere.declineCookies()

    const cookies = await context.cookies()
    const consent = cookies.find((c) => c.name === 'cookieConsent')
    expect(consent?.value).toBe('declined')
  })

  test('downloads the customers as a CSV with the right data', async ({ mockedPage }) => {
    const engageSphere = customersPage(mockedPage)

    const downloadPromise = engageSphere.waitForDownload()
    await engageSphere.downloadCsvButton.click()
    const download = await downloadPromise

    expect(download.suggestedFilename()).toBe('customers.csv')

    const content = fs.readFileSync(await download.path(), 'utf8')
    expect(content).toBe(csvSample)
  })
})
