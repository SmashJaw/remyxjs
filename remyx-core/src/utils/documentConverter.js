import { markdownToHtml } from './markdownConverter.js'

/**
 * Supported document formats with their MIME types and extensions.
 */
const FORMAT_MAP = {
  // DOCX
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  // PDF
  'application/pdf': 'pdf',
  // Markdown
  'text/markdown': 'markdown',
  'text/x-markdown': 'markdown',
  // HTML
  'text/html': 'html',
  // Plain text
  'text/plain': 'text',
  // CSV
  'text/csv': 'csv',
  'application/csv': 'csv',
  // RTF
  'text/rtf': 'rtf',
  'application/rtf': 'rtf',
}

const EXTENSION_MAP = {
  '.docx': 'docx',
  '.pdf': 'pdf',
  '.md': 'markdown',
  '.markdown': 'markdown',
  '.html': 'html',
  '.htm': 'html',
  '.txt': 'text',
  '.csv': 'csv',
  '.tsv': 'csv',
  '.rtf': 'rtf',
}

/**
 * Get the file extension from a filename.
 */
function getExtension(filename) {
  const dot = filename.lastIndexOf('.')
  return dot >= 0 ? filename.slice(dot).toLowerCase() : ''
}

/**
 * Detect the format of a file by MIME type and extension.
 */
function detectFormat(file) {
  // Try MIME type first
  if (file.type && FORMAT_MAP[file.type]) {
    return FORMAT_MAP[file.type]
  }
  // Fall back to extension
  const ext = getExtension(file.name || '')
  return EXTENSION_MAP[ext] || null
}

/**
 * Read a file as text.
 */
function readAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`))
    reader.readAsText(file)
  })
}

/**
 * Read a file as ArrayBuffer.
 */
function readAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`))
    reader.readAsArrayBuffer(file)
  })
}

/**
 * Convert a DOCX file to HTML using mammoth (lazy-loaded).
 */
async function convertDocx(file) {
  const mammoth = await import('mammoth')
  const buffer = await readAsArrayBuffer(file)
  const result = await mammoth.convertToHtml({ arrayBuffer: buffer })
  return result.value
}

/**
 * Convert a PDF file to HTML using pdfjs-dist (lazy-loaded).
 * Extracts text content from each page and wraps in paragraphs.
 */
async function convertPdf(file) {
  const pdfjsLib = await import('pdfjs-dist')

  // Configure worker — use bundled worker or CDN fallback
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    try {
      const workerModule = await import('pdfjs-dist/build/pdf.worker.mjs')
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerModule.default || workerModule
    } catch {
      // Fallback: disable worker (runs on main thread)
      pdfjsLib.GlobalWorkerOptions.workerSrc = ''
    }
  }

  const buffer = await readAsArrayBuffer(file)
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise

  const pages = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()

    // Group text items into lines by Y position
    const lines = []
    let currentLine = []
    let lastY = null

    for (const item of textContent.items) {
      if (item.str === undefined) continue
      const y = Math.round(item.transform[5])

      if (lastY !== null && Math.abs(y - lastY) > 2) {
        if (currentLine.length > 0) {
          lines.push(currentLine.join(''))
        }
        currentLine = []
      }
      currentLine.push(item.str)
      lastY = y
    }
    if (currentLine.length > 0) {
      lines.push(currentLine.join(''))
    }

    // Group consecutive non-empty lines into paragraphs
    const paragraphs = []
    let currentPara = []
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed === '') {
        if (currentPara.length > 0) {
          paragraphs.push(currentPara.join(' '))
          currentPara = []
        }
      } else {
        currentPara.push(trimmed)
      }
    }
    if (currentPara.length > 0) {
      paragraphs.push(currentPara.join(' '))
    }

    if (paragraphs.length > 0) {
      if (pdf.numPages > 1) {
        pages.push(`<h3>Page ${i}</h3>`)
      }
      pages.push(paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('\n'))
    }
  }

  return pages.join('\n')
}

/**
 * Convert a Markdown file to HTML using the existing marked setup.
 */
async function convertMarkdown(file) {
  const text = await readAsText(file)
  return markdownToHtml(text)
}

/**
 * Read an HTML file and return its content.
 * Sanitization happens at insertion time via the engine sanitizer.
 */
async function convertHtml(file) {
  return readAsText(file)
}

/**
 * Convert a plain text file to HTML paragraphs.
 */
async function convertText(file) {
  const text = await readAsText(file)
  return text
    .split(/\n\n+/)
    .map((para) => {
      const escaped = escapeHtml(para.trim())
      if (!escaped) return ''
      return `<p>${escaped.replace(/\n/g, '<br>')}</p>`
    })
    .filter(Boolean)
    .join('\n')
}

/**
 * Convert a CSV/TSV file to an HTML table.
 */
async function convertCsv(file) {
  const text = await readAsText(file)
  const ext = getExtension(file.name || '')
  const delimiter = ext === '.tsv' ? '\t' : ','

  const rows = parseCsvRows(text, delimiter)
  if (rows.length === 0) return '<p></p>'

  const headerRow = rows[0]
  const bodyRows = rows.slice(1)

  let html = '<table>\n<thead>\n<tr>'
  for (const cell of headerRow) {
    html += `<th>${escapeHtml(cell)}</th>`
  }
  html += '</tr>\n</thead>\n<tbody>\n'

  for (const row of bodyRows) {
    html += '<tr>'
    for (let i = 0; i < headerRow.length; i++) {
      html += `<td>${escapeHtml(row[i] || '')}</td>`
    }
    html += '</tr>\n'
  }

  html += '</tbody>\n</table>'
  return html
}

/**
 * Parse CSV text into rows, handling quoted fields.
 */
function parseCsvRows(text, delimiter = ',') {
  const rows = []
  let current = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++ // skip escaped quote
        } else {
          inQuotes = false
        }
      } else {
        field += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === delimiter) {
      current.push(field.trim())
      field = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      current.push(field.trim())
      if (current.some((c) => c !== '')) {
        rows.push(current)
      }
      current = []
      field = ''
    } else {
      field += ch
    }
  }

  // Last field/row
  current.push(field.trim())
  if (current.some((c) => c !== '')) {
    rows.push(current)
  }

  return rows
}

/**
 * Convert an RTF file to HTML with basic formatting.
 * Strips RTF control words and extracts plain text, wrapping in paragraphs.
 */
async function convertRtf(file) {
  const text = await readAsText(file)

  // Remove RTF header/footer
  let content = text
    .replace(/^\{\\rtf[\s\S]*?(?=\\pard|[^\\{])/i, '')
    .replace(/\}$/g, '')

  // Remove font tables, color tables, stylesheet blocks
  content = content.replace(/\{\\fonttbl[\s\S]*?\}/g, '')
  content = content.replace(/\{\\colortbl[\s\S]*?\}/g, '')
  content = content.replace(/\{\\stylesheet[\s\S]*?\}/g, '')
  content = content.replace(/\{\\info[\s\S]*?\}/g, '')

  // Remove remaining group blocks
  content = content.replace(/\{[^{}]*\}/g, '')

  // Convert paragraph markers
  content = content.replace(/\\par\b/g, '\n\n')
  content = content.replace(/\\line\b/g, '\n')

  // Strip all remaining control words
  content = content.replace(/\\[a-z]+\d*\s?/gi, '')
  content = content.replace(/[{}]/g, '')

  // Convert Unicode escapes like \\u8217?
  content = content.replace(/\\u(\d+)\?/g, (_, code) => String.fromCharCode(parseInt(code)))

  // Clean up and wrap in paragraphs
  const paragraphs = content
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)

  if (paragraphs.length === 0) return '<p></p>'
  return paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('\n')
}

/**
 * Escape HTML special characters.
 */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Check if a file can be converted/imported.
 */
export function isImportableFile(file) {
  return detectFormat(file) !== null
}

/**
 * Get the accept string for file inputs (supported extensions).
 */
export function getSupportedExtensions() {
  return Object.keys(EXTENSION_MAP).join(',')
}

/**
 * Get a human-readable list of supported format names.
 */
export function getSupportedFormatNames() {
  return ['PDF', 'DOCX', 'Markdown', 'HTML', 'TXT', 'CSV', 'TSV', 'RTF']
}

/**
 * Convert a document file to HTML.
 *
 * @param {File} file - The file to convert
 * @returns {Promise<string>} The converted HTML content
 * @throws {Error} If the format is unsupported or conversion fails
 */
export async function convertDocument(file) {
  const format = detectFormat(file)

  if (!format) {
    throw new Error(`Unsupported file format: ${file.name}`)
  }

  switch (format) {
    case 'docx':
      return convertDocx(file)
    case 'pdf':
      return convertPdf(file)
    case 'markdown':
      return convertMarkdown(file)
    case 'html':
      return convertHtml(file)
    case 'text':
      return convertText(file)
    case 'csv':
      return convertCsv(file)
    case 'rtf':
      return convertRtf(file)
    default:
      throw new Error(`Unsupported format: ${format}`)
  }
}
