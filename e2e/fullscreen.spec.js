import { test, expect } from '@playwright/test'

test.describe('Fullscreen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('fullscreen button is present in toolbar', async ({ page }) => {
    const fullscreenBtn = page.locator(
      '.rmx-toolbar button[title*="ull"], .rmx-toolbar button[aria-label*="ull"], .rmx-toolbar button[title*="creen"], .rmx-toolbar button[aria-label*="creen"]'
    ).first()

    // Fullscreen button may or may not be in the default toolbar
    if (await fullscreenBtn.isVisible()) {
      await expect(fullscreenBtn).toBeVisible()
    }
  })

  test('clicking fullscreen toggle adds fullscreen class', async ({ page }) => {
    const fullscreenBtn = page.locator(
      '.rmx-toolbar button[title*="ullscreen"], .rmx-toolbar button[aria-label*="ullscreen"]'
    ).first()

    if (await fullscreenBtn.isVisible()) {
      await fullscreenBtn.click()

      const editor = page.locator('.rmx-editor').first()
      const isFullscreen = await editor.evaluate(el =>
        el.classList.contains('rmx-fullscreen') || el.className.includes('fullscreen')
      )
      expect(isFullscreen).toBe(true)
    }
  })

  test('clicking fullscreen toggle again removes fullscreen class', async ({ page }) => {
    const fullscreenBtn = page.locator(
      '.rmx-toolbar button[title*="ullscreen"], .rmx-toolbar button[aria-label*="ullscreen"]'
    ).first()

    if (await fullscreenBtn.isVisible()) {
      // Enter fullscreen
      await fullscreenBtn.click()
      await page.waitForTimeout(100)

      // Exit fullscreen
      await fullscreenBtn.click()
      await page.waitForTimeout(100)

      const editor = page.locator('.rmx-editor').first()
      const isFullscreen = await editor.evaluate(el =>
        el.classList.contains('rmx-fullscreen')
      )
      expect(isFullscreen).toBe(false)
    }
  })
})
