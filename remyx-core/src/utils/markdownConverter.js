import TurndownService from 'turndown'
import { gfm } from 'turndown-plugin-gfm'
import { marked } from 'marked'

// Lazy singletons — zero overhead when outputFormat is 'html'
let turndownInstance = null
let markedConfigured = false

function getTurndown() {
  if (!turndownInstance) {
    turndownInstance = new TurndownService({
      headingStyle: 'atx',
      hr: '---',
      bulletListMarker: '-',
      codeBlockStyle: 'fenced',
      fence: '```',
      emDelimiter: '*',
      strongDelimiter: '**',
      linkStyle: 'inlined',
    })
    turndownInstance.use(gfm)

    // Preserve <br> as markdown line breaks
    turndownInstance.addRule('lineBreak', {
      filter: 'br',
      replacement: () => '  \n',
    })

    // Handle editor-specific task list checkboxes
    turndownInstance.addRule('taskCheckbox', {
      filter(node) {
        return (
          node.nodeName === 'INPUT' &&
          node.type === 'checkbox' &&
          node.classList.contains('rmx-task-checkbox')
        )
      },
      replacement(content, node) {
        return node.checked ? '[x] ' : '[ ] '
      },
    })

    // Preserve underline as <u> tag in markdown (non-standard but useful)
    turndownInstance.addRule('underline', {
      filter: ['u'],
      replacement(content) {
        return `<u>${content}</u>`
      },
    })
  }
  return turndownInstance
}

function ensureMarkedConfigured() {
  if (!markedConfigured) {
    marked.setOptions({
      gfm: true,
      breaks: false,
    })
    markedConfigured = true
  }
}

/**
 * Convert HTML to Markdown (GFM)
 * @param {string} html
 * @returns {string}
 */
export function htmlToMarkdown(html) {
  if (!html || html === '<p><br></p>') return ''
  return getTurndown().turndown(html)
}

/**
 * Convert Markdown to HTML
 * @param {string} md
 * @returns {string}
 */
export function markdownToHtml(md) {
  if (!md) return ''
  ensureMarkedConfigured()
  return marked.parse(md)
}
