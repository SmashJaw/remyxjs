import { ALLOWED_TAGS, ALLOWED_STYLES } from '../constants/schema.js'

export class Sanitizer {
  constructor(options = {}) {
    this.allowedTags = options.allowedTags || ALLOWED_TAGS
    this.allowedStyles = options.allowedStyles || ALLOWED_STYLES
  }

  sanitize(html) {
    if (!html) return ''
    const parser = new DOMParser()
    const doc = parser.parseFromString(`<body>${html}</body>`, 'text/html')
    this._cleanNode(doc.body)
    return doc.body.innerHTML
  }

  _cleanNode(node) {
    const children = Array.from(node.childNodes)
    for (const child of children) {
      if (child.nodeType === Node.TEXT_NODE) continue
      if (child.nodeType === Node.COMMENT_NODE) {
        node.removeChild(child)
        continue
      }
      if (child.nodeType !== Node.ELEMENT_NODE) {
        node.removeChild(child)
        continue
      }

      const tagName = child.tagName.toLowerCase()
      const allowedAttrs = this.allowedTags[tagName]

      if (!allowedAttrs) {
        // Unwrap: keep children but remove the tag
        while (child.firstChild) {
          node.insertBefore(child.firstChild, child)
        }
        node.removeChild(child)
        continue
      }

      // Remove disallowed attributes
      const attrs = Array.from(child.attributes)
      for (const attr of attrs) {
        if (attr.name === 'style') {
          if (allowedAttrs.includes('style')) {
            this._cleanStyles(child)
          } else {
            child.removeAttribute('style')
          }
        } else if (!allowedAttrs.includes(attr.name)) {
          child.removeAttribute(attr.name)
        }
      }

      // Sanitize href to prevent javascript: URLs
      if (child.hasAttribute('href')) {
        const href = child.getAttribute('href')
        if (href && /^\s*javascript\s*:/i.test(href)) {
          child.setAttribute('href', '#')
        }
      }

      this._cleanNode(child)
    }
  }

  _cleanStyles(element) {
    const style = element.style
    const cleanedStyles = []

    for (const prop of this.allowedStyles) {
      const value = style.getPropertyValue(prop)
      if (value) {
        cleanedStyles.push(`${prop}: ${value}`)
      }
    }

    if (cleanedStyles.length > 0) {
      element.setAttribute('style', cleanedStyles.join('; '))
    } else {
      element.removeAttribute('style')
    }
  }
}
