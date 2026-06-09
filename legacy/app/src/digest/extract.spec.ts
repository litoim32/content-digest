import { describe, it, expect } from 'vitest'
import { htmlToText, decodeEntities } from '@/digest/extract'

describe('decodeEntities', () => {
  it('decodes named entities', () => {
    expect(decodeEntities('Tom &amp; Jerry &lt;3&gt; &quot;hi&quot;')).toBe('Tom & Jerry <3> "hi"')
  })

  it('decodes decimal and hex numeric entities', () => {
    expect(decodeEntities('&#39;A&#x41;')).toBe("'AA")
  })

  it('turns &nbsp; into a space', () => {
    expect(decodeEntities('a&nbsp;b')).toBe('a b')
  })

  it('leaves unknown entities untouched', () => {
    expect(decodeEntities('100% &fake; ok')).toBe('100% &fake; ok')
  })
})

describe('htmlToText', () => {
  it('strips tags and keeps text', () => {
    expect(htmlToText('<p>Hello <b>world</b></p>')).toBe('Hello world')
  })

  it('drops <script> and <style> contents entirely', () => {
    const html = '<style>.a{color:red}</style><p>Keep me</p><script>var x=1;</script>'
    expect(htmlToText(html)).toBe('Keep me')
  })

  it('removes HTML comments', () => {
    expect(htmlToText('<!-- hidden -->Visible')).toBe('Visible')
  })

  it('collapses whitespace and decodes entities', () => {
    const html = '<div>Tom &amp; Jerry</div>\n\n  <div>next   line</div>'
    expect(htmlToText(html)).toBe('Tom & Jerry next line')
  })

  it('returns an empty string for empty input', () => {
    expect(htmlToText('')).toBe('')
  })
})
