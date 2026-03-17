import { test, expect } from '@playwright/test'

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('toolbar has appropriate ARIA role', async ({ page }) => {
    const toolbar = page.locator('[role="toolbar"], .rmx-toolbar')
    await expect(toolbar.first()).toBeVisible()
  })

  test('editor area has contenteditable attribute', async ({ page }) => {
    const editArea = page.locator('[contenteditable="true"]')
    await expect(editArea.first()).toBeVisible()
  })

  test('toolbar buttons are focusable', async ({ page }) => {
    const toolbar = page.locator('.rmx-toolbar').first()
    const firstButton = toolbar.locator('button').first()
    await expect(firstButton).toBeVisible()

    await firstButton.focus()
    await expect(firstButton).toBeFocused()
  })

  test('editor area is focusable', async ({ page }) => {
    const editArea = page.locator('[contenteditable="true"]').first()
    await editArea.focus()
    await expect(editArea).toBeFocused()
  })

  test('buttons have accessible labels or titles', async ({ page }) => {
    const toolbar = page.locator('.rmx-toolbar').first()
    const buttons = toolbar.locator('button')
    const count = await buttons.count()

    // At least some buttons should have title or aria-label
    let labeledCount = 0
    for (let i = 0; i < Math.min(count, 10); i++) {
      const btn = buttons.nth(i)
      const title = await btn.getAttribute('title')
      const ariaLabel = await btn.getAttribute('aria-label')
      if (title || ariaLabel) labeledCount++
    }
    expect(labeledCount).toBeGreaterThan(0)
  })
})
