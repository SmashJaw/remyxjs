/**
 * Paste cleaning pipeline for rich text from various sources.
 * Handles Microsoft Word, Google Docs, LibreOffice, Apple Pages,
 * and other rich text editors.
 */

export function cleanPastedHTML(html) {
  if (!html) return ''

  let cleaned = html

  // ── Strip meta/head wrappers that some sources include ──
  cleaned = cleaned.replace(/<meta[^>]*>/gi, '')
  cleaned = cleaned.replace(/<\/?html[^>]*>/gi, '')
  cleaned = cleaned.replace(/<head[\s\S]*?<\/head>/gi, '')
  cleaned = cleaned.replace(/<\/?body[^>]*>/gi, '')
  cleaned = cleaned.replace(/<style[\s\S]*?<\/style>/gi, '')
  cleaned = cleaned.replace(/<title[\s\S]*?<\/title>/gi, '')
  cleaned = cleaned.replace(/<link[^>]*>/gi, '')

  // ── Microsoft Word cleanup ──
  cleaned = cleaned.replace(/<!--\[if[\s\S]*?endif\]-->/gi, '')
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '')
  cleaned = cleaned.replace(/<o:p[\s\S]*?<\/o:p>/gi, '')
  cleaned = cleaned.replace(/<w:[\s\S]*?<\/w:[\s\S]*?>/gi, '')
  cleaned = cleaned.replace(/<m:[\s\S]*?<\/m:[\s\S]*?>/gi, '')
  cleaned = cleaned.replace(/<\/?(xml|st1|v:|o:)[^>]*>/gi, '')

  // Remove mso-* styles (Word-specific CSS)
  cleaned = cleaned.replace(/\s*mso-[^:]+:[^;"]+;?/gi, '')

  // Remove class="Mso*" (Word paragraph classes)
  cleaned = cleaned.replace(/\s*class="Mso[^"]*"/gi, '')

  // Remove Word-specific attributes
  cleaned = cleaned.replace(/\s*lang="[^"]*"/gi, '')

  // ── Google Docs cleanup ──
  cleaned = cleaned.replace(/<b\s+id="docs-internal[^"]*"[^>]*>([\s\S]*?)<\/b>/gi, '$1')
  cleaned = cleaned.replace(/\s*id="docs-internal[^"]*"/gi, '')
  cleaned = cleaned.replace(/\s*id="h\.[a-z0-9]+"/gi, '')
  cleaned = cleaned.replace(/\s*class="c\d+"/gi, '')
  cleaned = cleaned.replace(/\s*dir="ltr"/gi, '')
  cleaned = cleaned.replace(/\s*role="presentation"/gi, '')

  // Google Docs wraps content in span with inline styles for weight/style
  // Convert <span style="font-weight: 700"> to <strong>
  cleaned = cleaned.replace(
    /<span\s+style="[^"]*font-weight:\s*(700|bold)[^"]*">([\s\S]*?)<\/span>/gi,
    '<strong>$2</strong>'
  )
  cleaned = cleaned.replace(
    /<span\s+style="[^"]*font-style:\s*italic[^"]*">([\s\S]*?)<\/span>/gi,
    '<em>$2</em>'
  )
  cleaned = cleaned.replace(
    /<span\s+style="[^"]*text-decoration:\s*line-through[^"]*">([\s\S]*?)<\/span>/gi,
    '<s>$2</s>'
  )

  // ── LibreOffice / OpenOffice cleanup ──
  cleaned = cleaned.replace(/<\/?(text|office|table|draw|style|number|fo|svg):[^>]*>/gi, '')
  cleaned = cleaned.replace(/\s*class="P\d+"/gi, '')
  cleaned = cleaned.replace(/\s*class="T\d+"/gi, '')
  cleaned = cleaned.replace(/\s*class="Table\d+"/gi, '')

  // ── Apple Pages / iWork cleanup ──
  cleaned = cleaned.replace(/\s*class="(s|p)\d+"/gi, '')
  cleaned = cleaned.replace(/<div\s+apple-content-edited="true"[^>]*>/gi, '<div>')

  // ── Common cleanup ──

  // Remove empty style attributes
  cleaned = cleaned.replace(/\s*style="\s*"/gi, '')

  // Remove empty class attributes
  cleaned = cleaned.replace(/\s*class="\s*"/gi, '')

  // Remove empty spans (no attributes)
  cleaned = cleaned.replace(/<span\s*>([\s\S]*?)<\/span>/gi, '$1')

  // Normalize whitespace in tags
  cleaned = cleaned.replace(/<(\w+)\s+>/g, '<$1>')

  // Remove empty paragraphs (except intentional line breaks)
  cleaned = cleaned.replace(/<p[^>]*>\s*<\/p>/gi, '')

  // Remove empty divs
  cleaned = cleaned.replace(/<div[^>]*>\s*<\/div>/gi, '')

  // ── Font tag conversion ──
  cleaned = cleaned.replace(/<font\s+face="([^"]*)"[^>]*>([\s\S]*?)<\/font>/gi,
    '<span style="font-family: $1">$2</span>')
  cleaned = cleaned.replace(/<font\s+color="([^"]*)"[^>]*>([\s\S]*?)<\/font>/gi,
    '<span style="color: $1">$2</span>')
  cleaned = cleaned.replace(/<font\s+size="([^"]*)"[^>]*>([\s\S]*?)<\/font>/gi, '$2')
  cleaned = cleaned.replace(/<\/?font[^>]*>/gi, '')

  // ── Normalize semantic tags ──
  cleaned = cleaned.replace(/<b(\s|>)/gi, '<strong$1')
  cleaned = cleaned.replace(/<\/b>/gi, '</strong>')
  cleaned = cleaned.replace(/<i(\s|>)/gi, '<em$1')
  cleaned = cleaned.replace(/<\/i>/gi, '</em>')

  // ── Convert Word-style list paragraphs to real lists ──
  cleaned = convertWordListParagraphs(cleaned)

  // ── Final whitespace cleanup ──
  cleaned = cleaned.replace(/(<br\s*\/?\s*>){3,}/gi, '<br><br>')

  return cleaned.trim()
}


/**
 * Detect Word-style list paragraphs and convert them to proper HTML lists.
 * Word often exports lists as:
 *   <p style="margin-left:36pt;text-indent:-18pt">·  Item text</p>
 *   <p style="margin-left:36pt;text-indent:-18pt">1.  Item text</p>
 */
function convertWordListParagraphs(html) {
  const bulletPatterns = /^[\s]*[·•●○◦▪▫–—-]\s*/
  const numberPatterns = /^[\s]*\d+[.)]\s*/
  const letterPatterns = /^[\s]*[a-zA-Z][.)]\s*/

  const parser = new DOMParser()
  const doc = parser.parseFromString(`<body>${html}</body>`, 'text/html')
  const paragraphs = doc.querySelectorAll('p')

  let inList = false
  let listType = null
  let listEl = null

  for (const p of paragraphs) {
    const text = p.textContent.trim()
    const style = p.getAttribute('style') || ''
    const hasIndent = /margin-left|padding-left|text-indent/i.test(style)

    const isBullet = bulletPatterns.test(text)
    const isNumber = numberPatterns.test(text) || letterPatterns.test(text)

    if ((isBullet || isNumber) && hasIndent) {
      const type = isBullet ? 'ul' : 'ol'

      if (!inList || listType !== type) {
        listEl = doc.createElement(type)
        p.parentNode.insertBefore(listEl, p)
        inList = true
        listType = type
      }

      const li = doc.createElement('li')
      const innerHtml = p.innerHTML
        .replace(/^[\s]*[·•●○◦▪▫–—-]\s*/, '')
        .replace(/^[\s]*\d+[.)]\s*/, '')
        .replace(/^[\s]*[a-zA-Z][.)]\s*/, '')
      li.innerHTML = innerHtml
      listEl.appendChild(li)
      p.parentNode.removeChild(p)
    } else {
      inList = false
      listType = null
      listEl = null
    }
  }

  return doc.body.innerHTML
}


/**
 * Detect whether plain text looks like Markdown content.
 * Returns true if the text contains enough markdown patterns
 * to justify converting it rather than treating it as plain text.
 *
 * @param {string} text - Plain text to check
 * @returns {boolean}
 */
export function looksLikeMarkdown(text) {
  if (!text || text.length < 3) return false

  const lines = text.split('\n')
  let markdownSignals = 0
  let totalNonEmptyLines = 0

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    totalNonEmptyLines++

    // ATX headings: # Heading, ## Heading, etc.
    if (/^#{1,6}\s+\S/.test(trimmed)) { markdownSignals += 2; continue }

    // Unordered list items: - item, * item, + item
    if (/^[-*+]\s+\S/.test(trimmed)) { markdownSignals++; continue }

    // Ordered list items: 1. item, 2) item
    if (/^\d+[.)]\s+\S/.test(trimmed)) { markdownSignals++; continue }

    // Task list items: - [x] item, - [ ] item
    if (/^[-*+]\s+\[[ xX]\]\s/.test(trimmed)) { markdownSignals += 2; continue }

    // Blockquotes: > text
    if (/^>\s/.test(trimmed)) { markdownSignals++; continue }

    // Horizontal rules: ---, ***, ___
    if (/^([-*_])\1{2,}$/.test(trimmed)) { markdownSignals++; continue }

    // Code fences: ```
    if (/^```/.test(trimmed)) { markdownSignals += 2; continue }

    // Bold: **text** or __text__
    if (/\*\*[^*]+\*\*/.test(trimmed) || /__[^_]+__/.test(trimmed)) { markdownSignals++; continue }

    // Italic: *text* (not in URLs or normal text)
    if (/(?<!\w)\*[^*\s][^*]*\*(?!\w)/.test(trimmed)) { markdownSignals++; continue }

    // Links: [text](url)
    if (/\[.+\]\(.+\)/.test(trimmed)) { markdownSignals++; continue }

    // Images: ![alt](url)
    if (/!\[.*\]\(.+\)/.test(trimmed)) { markdownSignals += 2; continue }

    // Tables: | col | col |
    if (/^\|.+\|/.test(trimmed)) { markdownSignals++; continue }

    // Table separator: |---|---|
    if (/^\|[\s-:|]+\|$/.test(trimmed)) { markdownSignals++; continue }

    // Inline code: `code`
    if (/`[^`]+`/.test(trimmed)) { markdownSignals++; continue }
  }

  if (totalNonEmptyLines === 0) return false

  // If at least 30% of non-empty lines have markdown signals,
  // or if there are 2+ signals total, it's probably markdown
  const ratio = markdownSignals / totalNonEmptyLines
  return ratio >= 0.3 || markdownSignals >= 2
}
