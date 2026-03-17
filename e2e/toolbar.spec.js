import { test, expect } from '@playwright/test'

test.describe('Toolbar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('toolbar is visible', async ({ page }) => {
    const toolbar = page.locator('.rmx-toolbar')
    await expect(toolbar.first()).toBeVisible()
  })

  test('toolbar contains formatting buttons', async ({ page }) => {
    const toolbar = page.locator('.rmx-toolbar').first()
    const buttons = toolbar.locator('button')
    const count = await buttons.count()
    expect(count).toBeGreaterThan(0)
  })

  test('toolbar has button groups', async ({ page }) => {
    const groups = page.locator('.rmx-toolbar .rmx-toolbar-group, .rmx-toolbar [class*="group"]')
    const count = await groups.count()
    expect(count).toBeGreaterThan(0)
  })

  test('dropdown menus can be opened', async ({ page }) => {
    // Look for a dropdown trigger button (heading, font, etc.)
    const dropdownTrigger = page.locator('.rmx-toolbar [aria-haspopup], .rmx-toolbar button[class*="dropdown"], .rmx-toolbar select').first()
    if (await dropdownTrigger.isVisible()) {
      await dropdownTrigger.click()
      // Wait a moment for dropdown to appear
      await page.waitForTimeout(200)
      // Check for dropdown/popup content
      const dropdown = page.locator('[role="listbox"], [role="menu"], .rmx-dropdown, .rmx-select-dropdown')
      await expect(dropdown.first()).toBeVisible()
    }
  })
})
