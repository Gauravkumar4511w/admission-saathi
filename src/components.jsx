import { useState } from 'react'
import { LANGUAGES, whatsappLink } from './store.js'

export function LanguagePicker({ value, onChange }) {
  return (
    <div className="segmented" role="radiogroup" aria-label="Jawab ki bhasha">
      {LANGUAGES.map((l) => (
        <button
          key={l.id}
          type="button"
          role="radio"
          aria-checked={value === l.id}
          className={value === l.id ? 'active' : ''}
          onClick={() => onChange(l.id)}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}

export function MessageBox({ text, onChange, phone, onRegenerate, busy }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="message-box">
      <div className="bubble">
        <textarea
          value={text}
          onChange={(e) => onChange(e.target.value)}
          rows={Math.min(14, Math.max(5, text.split('\n').length + 1))}
          aria-label="AI ka jawab (edit kar sakte hain)"
        />
      </div>
      <p className="hint">Bhejne se pehle zaroorat ho to upar edit kar lein.</p>
      <div className="row wrap">
        <button type="button" className="btn primary" onClick={copy}>
          {copied ? 'Copy ho gaya ✓' : 'Copy karein'}
        </button>
        <a className="btn whatsapp" href={whatsappLink(text, phone)} target="_blank" rel="noreferrer">
          WhatsApp mein kholein
        </a>
        {onRegenerate && (
          <button type="button" className="btn ghost" onClick={onRegenerate} disabled={busy}>
            {busy ? 'Ban raha hai…' : 'Naya version'}
          </button>
        )}
      </div>
    </div>
  )
}

export function ErrorNote({ message }) {
  if (!message) return null
  return (
    <div className="note error" role="alert">
      {message}
    </div>
  )
}
