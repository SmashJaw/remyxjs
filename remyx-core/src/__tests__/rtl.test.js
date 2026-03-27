import { detectTextDirection, applyAutoDirection, getCharDirection, isBiDiBoundary } from '../utils/rtl.js'

describe('RTL Utilities', () => {
  describe('detectTextDirection', () => {
    it('returns "auto" for empty/null input', () => {
      expect(detectTextDirection('')).toBe('auto')
      expect(detectTextDirection(null)).toBe('auto')
      expect(detectTextDirection(undefined)).toBe('auto')
    })

    it('returns "ltr" for Latin text', () => {
      expect(detectTextDirection('Hello world')).toBe('ltr')
    })

    it('returns "rtl" for Arabic text', () => {
      expect(detectTextDirection('مرحبا بالعالم')).toBe('rtl')
    })

    it('returns "rtl" for Hebrew text', () => {
      expect(detectTextDirection('שלום עולם')).toBe('rtl')
    })

    it('returns "auto" for numbers only', () => {
      expect(detectTextDirection('12345')).toBe('auto')
    })

    it('returns dominant direction for mixed text', () => {
      // Mostly Arabic with a few Latin characters
      expect(detectTextDirection('مرحبا hello بالعالم كيف حالك')).toBe('rtl')
      // Mostly English with a few Arabic characters
      expect(detectTextDirection('Hello world this is English مرحبا')).toBe('ltr')
    })
  })

  describe('applyAutoDirection', () => {
    it('sets dir="rtl" on element with Arabic text', () => {
      const el = document.createElement('p')
      el.textContent = 'مرحبا بالعالم'
      applyAutoDirection(el)
      expect(el.getAttribute('dir')).toBe('rtl')
    })

    it('sets dir="ltr" on element with Latin text', () => {
      const el = document.createElement('p')
      el.textContent = 'Hello world'
      applyAutoDirection(el)
      expect(el.getAttribute('dir')).toBe('ltr')
    })

    it('removes dir attribute for numbers only', () => {
      const el = document.createElement('p')
      el.setAttribute('dir', 'rtl')
      el.textContent = '12345'
      applyAutoDirection(el)
      expect(el.hasAttribute('dir')).toBe(false)
    })

    it('handles null/undefined element', () => {
      expect(() => applyAutoDirection(null)).not.toThrow()
      expect(() => applyAutoDirection(undefined)).not.toThrow()
    })
  })

  describe('getCharDirection', () => {
    it('returns "rtl" for Arabic characters', () => {
      expect(getCharDirection('م')).toBe('rtl')
      expect(getCharDirection('ع')).toBe('rtl')
    })

    it('returns "rtl" for Hebrew characters', () => {
      expect(getCharDirection('ש')).toBe('rtl')
      expect(getCharDirection('א')).toBe('rtl')
    })

    it('returns "ltr" for Latin characters', () => {
      expect(getCharDirection('A')).toBe('ltr')
      expect(getCharDirection('z')).toBe('ltr')
    })

    it('returns "neutral" for digits', () => {
      expect(getCharDirection('5')).toBe('neutral')
      expect(getCharDirection('0')).toBe('neutral')
    })

    it('returns "neutral" for punctuation', () => {
      expect(getCharDirection('.')).toBe('neutral')
      expect(getCharDirection(' ')).toBe('neutral')
    })

    it('returns "neutral" for empty/null/undefined', () => {
      expect(getCharDirection('')).toBe('neutral')
      expect(getCharDirection(null)).toBe('neutral')
      expect(getCharDirection(undefined)).toBe('neutral')
    })
  })

  describe('isBiDiBoundary', () => {
    it('returns true at boundary between LTR and RTL', () => {
      // "Helloمرحبا" — boundary at offset 5 (between 'o' and 'م')
      expect(isBiDiBoundary('Helloمرحبا', 5)).toBe(true)
    })

    it('returns true at boundary between RTL and LTR', () => {
      // "مرحباHello" — boundary at offset 5
      expect(isBiDiBoundary('مرحباHello', 5)).toBe(true)
    })

    it('returns false within same-direction text', () => {
      expect(isBiDiBoundary('Hello world', 3)).toBe(false)
      expect(isBiDiBoundary('مرحبا بالعالم', 3)).toBe(false)
    })

    it('returns false at start or end of text', () => {
      expect(isBiDiBoundary('Hello', 0)).toBe(false)
      expect(isBiDiBoundary('Hello', 5)).toBe(false)
    })

    it('skips neutral characters when detecting boundary', () => {
      // "Hello 123 مرحبا" — offset 10 (between '3' and ' ') should still detect boundary
      // because nearest strong chars are LTR ('3' is neutral, 'o' is LTR) and RTL ('م')
      expect(isBiDiBoundary('Hello 123 مرحبا', 10)).toBe(true)
    })

    it('returns false for empty/null text', () => {
      expect(isBiDiBoundary('', 0)).toBe(false)
      expect(isBiDiBoundary(null, 0)).toBe(false)
    })
  })
})
