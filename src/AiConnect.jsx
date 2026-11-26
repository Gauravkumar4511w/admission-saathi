import { useState } from 'react'

// Shown only when the server has no API key yet (local dev). The key goes straight
// to the local server's .env file; it is not kept in the browser.
export default function AiConnect({ onConnected }) {
  const [key, setKey] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function save(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/setup-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Key save nahi ho payi.')
      setKey('')
      onConnected()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="card connect" onSubmit={save}>
      <h2>AI connect karein (sirf ek baar)</h2>
      <p className="hint">
        platform.claude.com → API keys se apni key copy karein aur neeche paste karein. Key sirf aapke computer ki .env file
        mein save hogi.
      </p>
      <div className="row wrap">
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="sk-ant-..."
          autoComplete="off"
          aria-label="Anthropic API key"
          style={{ flex: '1 1 200px', minWidth: 0 }}
        />
        <button className="btn primary" disabled={busy || !key.trim()}>
          {busy ? 'Save ho raha hai…' : 'Key save karein'}
        </button>
      </div>
      {error && (
        <div className="note error" role="alert">
          {error}
        </div>
      )}
    </form>
  )
}
