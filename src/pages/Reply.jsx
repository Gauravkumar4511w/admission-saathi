import { useState } from 'react'
import { callApi, todayISO } from '../store.js'
import { ErrorNote, LanguagePicker, MessageBox } from '../components.jsx'
import AiConnect from '../AiConnect.jsx'

export default function Reply({ profile, ready, aiReady, onAiConnected, language, setLanguage, onSaveInquiry }) {
  const [question, setQuestion] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [reply, setReply] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [course, setCourse] = useState('')
  const [followUpDate, setFollowUpDate] = useState(todayISO(2))
  const [note, setNote] = useState('')
  const [savedName, setSavedName] = useState('')

  const courses = profile.courses.filter((c) => c.name.trim())

  async function generate(e) {
    e?.preventDefault()
    if (!question.trim()) return
    setBusy(true)
    setError('')
    try {
      const text = await callApi('/api/reply', { profile, language, question, studentName: name })
      setReply(text)
      setSavedName('')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  function save(e) {
    e.preventDefault()
    const who = name.trim() || 'Bina naam'
    onSaveInquiry({
      id: crypto.randomUUID(),
      name: who,
      phone: phone.trim(),
      course,
      question: question.trim(),
      lastReply: reply,
      followUpDate,
      note: note.trim(),
      status: 'open',
      followUps: 0,
      createdAt: new Date().toISOString(),
    })
    setSavedName(who)
    setQuestion('')
    setName('')
    setPhone('')
    setReply('')
    setCourse('')
    setNote('')
    setFollowUpDate(todayISO(2))
  }

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>AI reply tool</h1>
          <p className="lead">Parent/student ka sawaal paste karein, WhatsApp-ready jawab paayein.</p>
        </div>
      </header>

      {aiReady === false &&
        (import.meta.env.DEV ? (
          <AiConnect onConnected={onAiConnected} />
        ) : (
          <div className="note warn">AI abhi set nahi hai. Jawab banane ke liye thodi der baad try karein.</div>
        ))}
      {!ready && (
        <div className="note warn">
          Pehle <a href="#/setup">Business setup</a> mein centre ka naam aur courses daalein, taaki AI sahi fees aur timing bata sake.
        </div>
      )}
      {savedName && (
        <div className="note ok">
          {savedName} ki inquiry save ho gayi. <a href="#/followups">Follow-ups dekhein →</a>
        </div>
      )}

      <form className="card" onSubmit={generate}>
        <label>
          Parent/student ka sawaal *
          <textarea
            rows={5}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. Sir 12th PCM ki fees kitni hai? Weekend batch hai kya?"
            required
          />
        </label>
        <div className="grid two">
          <label>
            Naam (optional)
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Rahul ke papa" />
          </label>
          <label>
            WhatsApp number (optional)
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98765 43210" inputMode="tel" />
          </label>
        </div>
        <div className="row wrap between">
          <div className="field-inline">
            <span>Jawab ki bhasha</span>
            <LanguagePicker value={language} onChange={setLanguage} />
          </div>
          <button className="btn primary lg" disabled={busy || !question.trim()}>
            {busy ? 'Jawab ban raha hai…' : 'Jawab banayein'}
          </button>
        </div>
        <ErrorNote message={error} />
      </form>

      {reply && (
        <>
          <section className="card">
            <h2>WhatsApp jawab</h2>
            <MessageBox text={reply} onChange={setReply} phone={phone} onRegenerate={generate} busy={busy} />
          </section>

          <form className="card" onSubmit={save}>
            <h2>Inquiry note karein</h2>
            <p className="hint">Taaki follow-up yaad rahe. Sab is browser mein save hota hai.</p>
            <div className="grid two">
              <label>
                Naam
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Rahul ke papa" />
              </label>
              <label>
                Course
                <select value={course} onChange={(e) => setCourse(e.target.value)}>
                  <option value="">— chunein —</option>
                  {courses.map((c) => (
                    <option key={c.name}>{c.name}</option>
                  ))}
                </select>
              </label>
              <label>
                Follow-up date
                <input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} required />
              </label>
              <label>
                Note (optional)
                <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Demo ke liye Saturday bola" />
              </label>
            </div>
            <button className="btn primary">Inquiry save karein</button>
          </form>
        </>
      )}
    </div>
  )
}
