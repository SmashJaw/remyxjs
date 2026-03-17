import { test, expect } from '@playwright/test'

test.describe('Editor Basics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('page loads with the demo title', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Remyx Editor Demo')
  })

  test('editor is visible on the page', async ({ page }) => {
    const editor = page.locator('.rmx-editor')
    await expect(editor.first()).toBeVisible()
  })

  test('contenteditable area is present', async ({ page }) => {
    const editArea = page.locator('[contenteditable="true"]')
    await expect(editArea.first()).toBeVisible()
  })

  test('can type text into the editor', async ({ page }) => {
    const editArea = page.locator('[contenteditable="true"]').first()
    await editArea.click()
    await editArea.pressSequentially('Hello, Remyx!')

    await expect(editArea).toContainText('Hello, Remyx!')
  })

  test('editor has the rmx-edit-area class', async ({ page }) => {
    const editArea = page.locator('.rmx-edit-area')
    await expect(editArea.first()).toBeVisible()
  })
})
