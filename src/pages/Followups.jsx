import { useState } from 'react'
import { callApi, formatDate, todayISO } from '../store.js'
import { ErrorNote, LanguagePicker, MessageBox } from '../components.jsx'

const FILTERS = [
  { id: 'due', label: 'Aaj / baaki' },
  { id: 'upcoming', label: 'Aage ke' },
  { id: 'closed', label: 'Band' },
  { id: 'all', label: 'Sab' },
]

const STATUS_LABEL = { open: 'Open', joined: 'Joined ✓', lost: 'Not interested' }

export default function Followups({ profile, inquiries, setInquiries, language, setLanguage }) {
  const [filter, setFilter] = useState('due')
  const [adding, setAdding] = useState(false)
  const today = todayISO()

  const update = (id, patch) => setInquiries((list) => list.map((q) => (q.id === id ? { ...q, ...patch } : q)))
  const remove = (id) => {
    if (confirm('Yeh inquiry delete karein?')) setInquiries((list) => list.filter((q) => q.id !== id))
  }

  const visible = inquiries
    .filter((q) => {
      if (filter === 'all') return true
      if (filter === 'closed') return q.status !== 'open'
      if (q.status !== 'open') return false
      return filter === 'due' ? q.followUpDate <= today : q.followUpDate > today
    })
    .sort((a, b) => (a.followUpDate || '').localeCompare(b.followUpDate || ''))

  const counts = {
    due: inquiries.filter((q) => q.status === 'open' && q.followUpDate <= today).length,
    upcoming: inquiries.filter((q) => q.status === 'open' && q.followUpDate > today).length,
    closed: inquiries.filter((q) => q.status !== 'open').length,
    all: inquiries.length,
  }

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>Follow-ups</h1>
          <p className="lead">Kisko aaj reminder bhejna hai — AI message draft karega, aap copy karke bhejein.</p>
        </div>
        <div className="row wrap">
          <LanguagePicker value={language} onChange={setLanguage} />
          <button type="button" className="btn ghost" onClick={() => setAdding((v) => !v)}>
            {adding ? 'Band karein' : '+ Inquiry jodein'}
          </button>
        </div>
      </header>

      {adding && (
        <AddInquiry
          courses={profile.courses.filter((c) => c.name.trim())}
          onAdd={(q) => {
            setInquiries((list) => [q, ...list])
            setAdding(false)
            setFilter(q.followUpDate <= today ? 'due' : 'upcoming')
          }}
        />
      )}

      <div className="tabs" role="tablist">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            role="tab"
            aria-selected={filter === f.id}
            className={filter === f.id ? 'active' : ''}
            onClick={() => setFilter(f.id)}
          >
            {f.label} <span className="count">{counts[f.id]}</span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="empty">
          {inquiries.length === 0 ? (
            <>
              Abhi koi inquiry nahi. <a href="#/reply">AI reply tool</a> se jawab banakar inquiry save karein.
            </>
          ) : filter === 'due' ? (
            'Aaj ke saare follow-up ho gaye 🎉'
          ) : (
            'Is list mein kuch nahi.'
          )}
        </div>
      ) : (
        <ul className="inquiry-list">
          {visible.map((q) => (
            <InquiryCard
              key={q.id}
              inquiry={q}
              today={today}
              profile={profile}
              language={language}
              onUpdate={(patch) => update(q.id, patch)}
              onDelete={() => remove(q.id)}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

function InquiryCard({ inquiry: q, today, profile, language, onUpdate, onDelete }) {
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [nextDate, setNextDate] = useState(todayISO(3))

  const overdue = q.status === 'open' && q.followUpDate < today
  const dueToday = q.status === 'open' && q.followUpDate === today

  async function makeDraft() {
    setBusy(true)
    setError('')
    try {
      setDraft(await callApi('/api/followup', { profile, language, inquiry: q }))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  function markSent() {
    onUpdate({ followUpDate: nextDate, followUps: (q.followUps || 0) + 1, lastReply: draft || q.lastReply })
    setDraft('')
  }

  return (
    <li className={`card inquiry ${overdue ? 'overdue' : ''}`}>
      <div className="inquiry-top">
        <div>
          <h3>{q.name}</h3>
          <p className="meta">
            {q.course || 'Course not set'}
            {q.phone && <> · {q.phone}</>}
            {q.followUps > 0 && <> · {q.followUps} follow-up bheje</>}
          </p>
        </div>
        <span className={`badge ${q.status !== 'open' ? q.status : overdue ? 'late' : dueToday ? 'today' : ''}`}>
          {q.status !== 'open'
            ? STATUS_LABEL[q.status]
            : overdue
              ? `Late · ${formatDate(q.followUpDate)}`
              : dueToday
                ? 'Aaj'
                : formatDate(q.followUpDate)}
        </span>
      </div>
      {q.question && <p className="quote">“{q.question}”</p>}
      {q.note && <p className="meta">Note: {q.note}</p>}

      {q.status === 'open' && !draft && (
        <div className="row wrap">
          <button className="btn primary" onClick={makeDraft} disabled={busy}>
            {busy ? 'Draft ban raha hai…' : 'Follow-up message banayein'}
          </button>
          <button className="btn ghost sm" onClick={() => onUpdate({ status: 'joined' })}>
            Joined ✓
          </button>
          <button className="btn ghost sm" onClick={() => onUpdate({ status: 'lost' })}>
            Not interested
          </button>
        </div>
      )}
      {q.status !== 'open' && (
        <div className="row wrap">
          <button className="btn ghost sm" onClick={() => onUpdate({ status: 'open', followUpDate: today })}>
            Dobara kholein
          </button>
          <button className="link danger" onClick={onDelete}>
            Delete
          </button>
        </div>
      )}
      <ErrorNote message={error} />

      {draft && (
        <div className="followup-draft">
          <MessageBox text={draft} onChange={setDraft} phone={q.phone} onRegenerate={makeDraft} busy={busy} />
          <div className="row wrap sent-row">
            <label className="field-inline">
              <span>Bhej diya? Agla follow-up:</span>
              <input type="date" value={nextDate} onChange={(e) => setNextDate(e.target.value)} />
            </label>
            <button className="btn primary sm" onClick={markSent}>
              Bhej diya ✓
            </button>
            <button className="link" onClick={() => setDraft('')}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </li>
  )
}

function AddInquiry({ courses, onAdd }) {
  const [form, setForm] = useState({ name: '', phone: '', course: '', question: '', followUpDate: todayISO(), note: '' })
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  function submit(e) {
    e.preventDefault()
    onAdd({
      ...form,
      id: crypto.randomUUID(),
      name: form.name.trim(),
      lastReply: '',
      status: 'open',
      followUps: 0,
      createdAt: new Date().toISOString(),
    })
  }

  return (
    <form className="card" onSubmit={submit}>
      <h2>Nayi inquiry (call / walk-in)</h2>
      <div className="grid two">
        <label>
          Naam *
          <input value={form.name} onChange={(e) => set('name', e.target.value)} required />
        </label>
        <label>
          WhatsApp number
          <input value={form.phone} onChange={(e) => set('phone', e.target.value)} inputMode="tel" />
        </label>
        <label>
          Course
          <select value={form.course} onChange={(e) => set('course', e.target.value)}>
            <option value="">— chunein —</option>
            {courses.map((c) => (
              <option key={c.name}>{c.name}</option>
            ))}
          </select>
        </label>
        <label>
          Follow-up date
          <input type="date" value={form.followUpDate} onChange={(e) => set('followUpDate', e.target.value)} required />
        </label>
        <label className="span2">
          Kya poocha tha?
          <input value={form.question} onChange={(e) => set('question', e.target.value)} placeholder="Fees aur weekend batch ke baare mein" />
        </label>
      </div>
      <button className="btn primary">Save karein</button>
    </form>
  )
}
