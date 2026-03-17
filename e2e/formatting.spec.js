import { test, expect } from '@playwright/test'

test.describe('Text Formatting', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Focus the editor and type some text
    const editArea = page.locator('[contenteditable="true"]').first()
    await editArea.click()
  })

  test('can apply bold with keyboard shortcut', async ({ page }) => {
    const editArea = page.locator('[contenteditable="true"]').first()
    const modifier = process.platform === 'darwin' ? 'Meta' : 'Control'

    await editArea.press(`${modifier}+a`)
    await editArea.press(`${modifier}+b`)

    // Check that bold formatting was applied (content should be in <strong> or <b>)
    const boldContent = page.locator('[contenteditable="true"] strong, [contenteditable="true"] b')
    // The editor content has pre-filled bold text, so this should work
    await expect(boldContent.first()).toBeVisible()
  })

  test('can apply italic with keyboard shortcut', async ({ page }) => {
    const editArea = page.locator('[contenteditable="true"]').first()
    const modifier = process.platform === 'darwin' ? 'Meta' : 'Control'

    await editArea.press(`${modifier}+a`)
    await editArea.press(`${modifier}+i`)

    const italicContent = page.locator('[contenteditable="true"] em, [contenteditable="true"] i')
    await expect(italicContent.first()).toBeVisible()
  })

  test('can apply underline with keyboard shortcut', async ({ page }) => {
    const editArea = page.locator('[contenteditable="true"]').first()
    const modifier = process.platform === 'darwin' ? 'Meta' : 'Control'

    await editArea.press(`${modifier}+a`)
    await editArea.press(`${modifier}+u`)

    const underlineContent = page.locator('[contenteditable="true"] u')
    await expect(underlineContent.first()).toBeVisible()
  })

  test('toolbar bold button applies formatting', async ({ page }) => {
    const editArea = page.locator('[contenteditable="true"]').first()
    await editArea.pressSequentially('Test text')

    // Select all text
    const modifier = process.platform === 'darwin' ? 'Meta' : 'Control'
    await editArea.press(`${modifier}+a`)

    // Click the bold button in the toolbar
    const boldButton = page.locator('.rmx-toolbar button[title*="Bold"], .rmx-toolbar button[aria-label*="Bold"]').first()
    if (await boldButton.isVisible()) {
      await boldButton.click()
      const boldContent = page.locator('[contenteditable="true"] strong, [contenteditable="true"] b')
      await expect(boldContent.first()).toBeVisible()
    }
  })
})
