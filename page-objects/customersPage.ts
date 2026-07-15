import { type Page } from '@playwright/test'

export function customersPage(page: Page) {
  const table = page.getByRole('table')
  const loading = page.getByText('Loading...')
  const emptyStateImage = page.locator('svg[title="image of an empty box"]')
  const emptyStateMessage = page.getByText('No customers available.')
  const nameInput = page.getByTestId('name')
  const sizeFilter = page.getByTestId('size-filter')
  const industryFilter = page.getByTestId('industry-filter')
  const downloadCsvButton = page.getByRole('button', { name: 'Download CSV' })
  const themeToggle = page.locator('[aria-label="theme light activated"]')
  const paginationLimit = page.locator('[aria-label="Pagination limit"]')
  const acceptCookiesButton = page.getByRole('button', { name: 'Accept' })
  const declineCookiesButton = page.getByRole('button', { name: 'Decline' })

  return {
    table,
    loading,
    emptyStateImage,
    emptyStateMessage,
    nameInput,
    sizeFilter,
    industryFilter,
    downloadCsvButton,
    themeToggle,
    paginationLimit,
    acceptCookiesButton,
    declineCookiesButton,
    customerNamed: (name: string) => page.getByText(name),
    open: () => page.goto('/'),
    reload: () => page.reload(),
    filterBySize: (size: string) => sizeFilter.selectOption(size),
    filterByIndustry: (industry: string) => industryFilter.selectOption(industry),
    switchToDarkMode: () => themeToggle.click(),
    setPaginationLimit: (limit: string) => paginationLimit.selectOption(limit),
    acceptCookies: () => acceptCookiesButton.click(),
    declineCookies: () => declineCookiesButton.click(),
    readLocalStorage: (key: string) =>
      page.evaluate((k) => localStorage.getItem(k), key),
    waitForDownload: () => page.waitForEvent('download'),
  }
}
