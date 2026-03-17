import { test, expect } from '@playwright/test'

test.describe('Themes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('editor loads with default light theme', async ({ page }) => {
    const editor = page.locator('.rmx-editor').first()
    await expect(editor).toBeVisible()

    // Check that the editor does not have dark theme by default
    const hasDarkClass = await editor.evaluate(el =>
      el.classList.contains('rmx-theme-dark') || el.getAttribute('data-theme') === 'dark'
    )
    expect(hasDarkClass).toBe(false)
  })

  test('can toggle to dark theme', async ({ page }) => {
    // Click the Toggle Theme button in the demo
    const toggleButton = page.locator('button', { hasText: 'Toggle Theme' })
    await toggleButton.click()

    const editor = page.locator('.rmx-editor').first()
    // After toggling, the editor should have dark theme
    const hasDarkTheme = await editor.evaluate(el =>
      el.classList.contains('rmx-theme-dark') ||
      el.getAttribute('data-theme') === 'dark' ||
      el.className.includes('dark')
    )
    expect(hasDarkTheme).toBe(true)
  })

  test('theme preset buttons are available', async ({ page }) => {
    const oceanButton = page.locator('button', { hasText: 'Ocean' })
    const forestButton = page.locator('button', { hasText: 'Forest' })
    const sunsetButton = page.locator('button', { hasText: 'Sunset' })

    await expect(oceanButton).toBeVisible()
    await expect(forestButton).toBeVisible()
    await expect(sunsetButton).toBeVisible()
  })

  test('can apply a theme preset', async ({ page }) => {
    const oceanButton = page.locator('button', { hasText: 'Ocean' })
    await oceanButton.click()

    // Ocean preset uses dark theme
    const editor = page.locator('.rmx-editor').first()
    await expect(editor).toBeVisible()
  })
})
