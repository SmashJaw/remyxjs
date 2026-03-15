import React, { useState, useRef } from 'react'
import { RemyxEditor, RemyxConfigProvider, defineConfig, createToolbarItemTheme } from '../src/index.js'

const DEMO_CONFIG = defineConfig({
  theme: 'dark',
  placeholder: 'Default config placeholder...',
  height: 300,
  editors: {
    minimal: {
      toolbar: [['bold', 'italic', 'underline'], ['link']],
      floatingToolbar: false,
      height: 200,
      placeholder: 'Minimal editor...',
    },
    comments: {
      toolbar: [['bold', 'italic', 'underline', 'strikethrough'], ['orderedList', 'unorderedList'], ['link']],
      statusBar: false,
      height: 150,
      placeholder: 'Write a comment...',
    },
  },
})

const DEMO_ITEM_THEME = createToolbarItemTheme({
  bold: { color: '#e11d48', activeColor: '#be123c', activeBackground: '#ffe4e6', borderRadius: '50%' },
  italic: { color: '#7c3aed', activeColor: '#6d28d9', activeBackground: '#ede9fe' },
  underline: { color: '#0891b2', activeColor: '#0e7490', activeBackground: '#cffafe' },
  _separator: { color: '#c4b5fd', width: '2px' },
})

const INITIAL_HTML = `
<h2>Welcome to Remyx Editor</h2>
<p>A fully-featured <strong>WYSIWYG editor</strong> built with React. Try out all the features:</p>
<h3>Text Formatting</h3>
<p>You can make text <strong>bold</strong>, <em>italic</em>, <u>underlined</u>, or <s>strikethrough</s>. You can also use <sub>subscript</sub> and <sup>superscript</sup>.</p>
<h3>Lists</h3>
<ul>
  <li>Bulleted list item 1</li>
  <li>Bulleted list item 2</li>
  <li>Bulleted list item 3</li>
</ul>
<ol>
  <li>Numbered list item 1</li>
  <li>Numbered list item 2</li>
  <li>Numbered list item 3</li>
</ol>
<h3>Block Elements</h3>
<blockquote>This is a blockquote. Use it to highlight important text or citations.</blockquote>
<pre><code>// This is a code block
function hello() {
  console.log("Hello, Remyx!");
}</code></pre>
<h3>Tables</h3>
<table class="rmx-table">
  <tbody>
    <tr><td><strong>Feature</strong></td><td><strong>Status</strong></td></tr>
    <tr><td>Rich Text</td><td>Complete</td></tr>
    <tr><td>Tables</td><td>Complete</td></tr>
    <tr><td>Images</td><td>Complete</td></tr>
  </tbody>
</table>
<p>Try inserting links, images, tables, and more using the toolbar above!</p>
`.trim()

const INITIAL_MARKDOWN = `## Welcome to Remyx Editor

A fully-featured **WYSIWYG editor** built with React. Try out all the features:

### Text Formatting

You can make text **bold**, *italic*, ~~strikethrough~~, and more.

### Lists

- Bulleted list item 1
- Bulleted list item 2
- Bulleted list item 3

1. Numbered list item 1
2. Numbered list item 2
3. Numbered list item 3

### Block Elements

> This is a blockquote. Use it to highlight important text or citations.

\`\`\`
// This is a code block
function hello() {
  console.log("Hello, Remyx!");
}
\`\`\`

### Tables

| Feature | Status |
|---------|--------|
| Rich Text | Complete |
| Tables | Complete |
| Images | Complete |

Try inserting links, images, tables, and more using the toolbar above!
`.trim()

export default function App() {
  const [theme, setTheme] = useState('light')
  const [outputFormat, setOutputFormat] = useState('html')
  const [htmlContent, setHtmlContent] = useState(INITIAL_HTML)
  const [mdContent, setMdContent] = useState(INITIAL_MARKDOWN)
  const [showOutput, setShowOutput] = useState(false)
  const [demoMode, setDemoMode] = useState('standalone')
  const [itemThemeOn, setItemThemeOn] = useState(false)
  const textareaRef = useRef(null)
  const divRef = useRef(null)

  const content = outputFormat === 'markdown' ? mdContent : htmlContent
  const setContent = outputFormat === 'markdown' ? setMdContent : setHtmlContent

  const btnStyle = (active) => ({
    padding: '6px 14px',
    borderRadius: 6,
    border: '1px solid #ccc',
    cursor: 'pointer',
    background: active
      ? '#1a73e8'
      : (theme === 'dark' ? '#333' : '#fff'),
    color: active ? '#fff' : (theme === 'dark' ? '#e0e0e0' : '#333'),
    fontWeight: active ? 600 : 400,
  })

  return (
    <div style={{
      maxWidth: 960,
      margin: '0 auto',
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: theme === 'dark' ? '#121212' : '#f0f2f5',
      minHeight: '100vh',
      color: theme === 'dark' ? '#e0e0e0' : '#1a1a1a',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>Remyx Editor</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
            style={btnStyle(false)}>
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
          <button onClick={() => setItemThemeOn(v => !v)}
            style={btnStyle(itemThemeOn)}>
            Item Theme
          </button>
          <button onClick={() => setShowOutput(s => !s)}
            style={btnStyle(false)}>
            {showOutput ? 'Hide Output' : 'Show Output'}
          </button>
        </div>
      </div>

      {/* Format & mode selector */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 500 }}>Format:</span>
          <button onClick={() => setOutputFormat('html')} style={btnStyle(outputFormat === 'html')}>
            HTML
          </button>
          <button onClick={() => setOutputFormat('markdown')} style={btnStyle(outputFormat === 'markdown')}>
            Markdown
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 500 }}>Attach:</span>
          <button onClick={() => setDemoMode('standalone')} style={btnStyle(demoMode === 'standalone')}>
            Standalone
          </button>
          <button onClick={() => setDemoMode('textarea')} style={btnStyle(demoMode === 'textarea')}>
            Textarea
          </button>
          <button onClick={() => setDemoMode('div')} style={btnStyle(demoMode === 'div')}>
            Div
          </button>
          <button onClick={() => setDemoMode('config')} style={btnStyle(demoMode === 'config')}>
            Config File
          </button>
        </div>
      </div>

      {/* Standalone mode */}
      {demoMode === 'standalone' && (
        <RemyxEditor
          key={outputFormat}
          value={content}
          onChange={setContent}
          outputFormat={outputFormat}
          theme={theme}
          placeholder="Start typing here..."
          height={450}
          onReady={(engine) => console.log('Editor ready!', engine)}
          toolbarItemTheme={itemThemeOn ? DEMO_ITEM_THEME : undefined}
        />
      )}

      {/* Textarea mode */}
      {demoMode === 'textarea' && (
        <div>
          <p style={{ fontSize: 13, color: theme === 'dark' ? '#aaa' : '#666', margin: '0 0 8px 0' }}>
            The editor is attached to the textarea below. The textarea is hidden and its value stays in sync.
          </p>
          <textarea
            ref={textareaRef}
            defaultValue={outputFormat === 'markdown'
              ? '## From Textarea\n\nThis **markdown** content came from the textarea.'
              : '<p>This content came from the <strong>textarea</strong>. Edit it with the WYSIWYG editor!</p>'}
            rows={6}
            style={{
              width: '100%', padding: 12, borderRadius: 6, border: '1px solid #ccc',
              fontSize: 14, fontFamily: 'monospace',
              background: theme === 'dark' ? '#1e1e1e' : '#fff',
              color: theme === 'dark' ? '#e0e0e0' : '#333',
            }}
          />
          <RemyxEditor
            key={`textarea-${outputFormat}`}
            attachTo={textareaRef}
            outputFormat={outputFormat}
            theme={theme}
            placeholder="Type in the attached textarea editor..."
            height={350}
          />
        </div>
      )}

      {/* Div mode */}
      {demoMode === 'div' && (
        <div>
          <p style={{ fontSize: 13, color: theme === 'dark' ? '#aaa' : '#666', margin: '0 0 8px 0' }}>
            The editor is attached to the div below, using its HTML content as the starting point.
          </p>
          <div
            ref={divRef}
            style={{
              border: '1px solid #ccc', borderRadius: 6,
              background: theme === 'dark' ? '#1e1e1e' : '#fff',
            }}
          >
            <h3>Content from a div</h3>
            <p>This content was originally <em>inside the div element</em>.</p>
          </div>
          <RemyxEditor
            key={`div-${outputFormat}`}
            attachTo={divRef}
            outputFormat={outputFormat}
            theme={theme}
            placeholder="Type in the attached div editor..."
            height={350}
          />
        </div>
      )}

      {/* Config file mode — multiple editors with named configs */}
      {demoMode === 'config' && (
        <RemyxConfigProvider config={DEMO_CONFIG}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: 14 }}>Default Config (dark theme from config)</h3>
              <RemyxEditor />
            </div>
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: 14 }}>config="minimal" (small toolbar, 200px)</h3>
              <RemyxEditor config="minimal" />
            </div>
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: 14 }}>config="comments" (no status bar, 150px)</h3>
              <RemyxEditor config="comments" />
            </div>
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: 14 }}>config="minimal" + prop override (theme="light")</h3>
              <RemyxEditor config="minimal" theme="light" />
            </div>
          </div>
        </RemyxConfigProvider>
      )}

      {showOutput && (
        <div style={{ marginTop: 16 }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: 14 }}>
            {outputFormat === 'markdown' ? 'Markdown' : 'HTML'} Output:
          </h3>
          <pre style={{
            padding: 16,
            background: theme === 'dark' ? '#1e1e1e' : '#fff',
            border: '1px solid ' + (theme === 'dark' ? '#3e3e3e' : '#ddd'),
            borderRadius: 6,
            fontSize: 12,
            overflow: 'auto',
            maxHeight: 300,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
          }}>
            {content}
          </pre>
        </div>
      )}
    </div>
  )
}
