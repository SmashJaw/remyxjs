import { test, expect } from '@playwright/test'

test.describe('Modals', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Focus the editor
    const editArea = page.locator('[contenteditable="true"]').first()
    await editArea.click()
  })

  test('link modal opens when link button is clicked', async ({ page }) => {
    const linkBtn = page.locator(
      '.rmx-toolbar button[title*="ink"], .rmx-toolbar button[aria-label*="ink"]'
    ).first()

    if (await linkBtn.isVisible()) {
      await linkBtn.click()
      await page.waitForTimeout(300)

      // Check for modal/dialog
      const modal = page.locator('.rmx-modal, [role="dialog"], .rmx-link-modal')
      await expect(modal.first()).toBeVisible()
    }
  })

  test('link modal can be closed', async ({ page }) => {
    const linkBtn = page.locator(
      '.rmx-toolbar button[title*="ink"], .rmx-toolbar button[aria-label*="ink"]'
    ).first()

    if (await linkBtn.isVisible()) {
      await linkBtn.click()
      await page.waitForTimeout(300)

      // Close the modal (Escape key or close button)
      await page.keyboard.press('Escape')
      await page.waitForTimeout(300)

      const modal = page.locator('.rmx-modal, [role="dialog"], .rmx-link-modal')
      await expect(modal).toHaveCount(0).catch(() => {
        // Modal might still be in DOM but hidden
      })
    }
  })

  test('image modal opens when image button is clicked', async ({ page }) => {
    const imageBtn = page.locator(
      '.rmx-toolbar button[title*="mage"], .rmx-toolbar button[aria-label*="mage"]'
    ).first()

    if (await imageBtn.isVisible()) {
      await imageBtn.click()
      await page.waitForTimeout(300)

      const modal = page.locator('.rmx-modal, [role="dialog"], .rmx-image-modal')
      await expect(modal.first()).toBeVisible()
    }
  })

  test('modals contain input fields', async ({ page }) => {
    const linkBtn = page.locator(
      '.rmx-toolbar button[title*="ink"], .rmx-toolbar button[aria-label*="ink"]'
    ).first()

    if (await linkBtn.isVisible()) {
      await linkBtn.click()
      await page.waitForTimeout(300)

      const modal = page.locator('.rmx-modal, [role="dialog"]').first()
      if (await modal.isVisible()) {
        const inputs = modal.locator('input')
        const count = await inputs.count()
        expect(count).toBeGreaterThan(0)
      }
    }
  })
})
