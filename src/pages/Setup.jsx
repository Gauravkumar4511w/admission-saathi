import { useState } from 'react'
import { emptyProfile } from '../store.js'

const SAMPLE = {
  name: 'Vidya Classes',
  location: 'Shop 12, Gandhi Market, Near City Mall, Indore',
  phone: '98765 43210',
  timings: 'Office: 10am–8pm, Monday–Saturday. Sunday band.',
  courses: [
    { name: 'Class 10 Maths + Science', fee: '₹2,500/month', duration: 'April–March', timing: '4–6 pm, Mon–Sat', notes: 'Batch size 20' },
    { name: 'Class 12 PCM (Boards + JEE basics)', fee: '₹4,000/month', duration: '1 year', timing: '6–8 pm, Mon–Sat', notes: '' },
    { name: 'Spoken English', fee: '₹6,000 full course', duration: '3 months', timing: '11am–12pm or 7–8pm', notes: 'Weekend batch bhi hai' },
  ],
  faqs: [
    { q: 'Demo class milti hai?', a: 'Haan, 2 free demo classes. Pehle call karke slot book karein.' },
    { q: 'Fees installment mein de sakte hain?', a: 'Haan, monthly ya 3 installments mein.' },
    { q: 'Test hote hain?', a: 'Har Sunday weekly test, aur monthly parent-teacher meeting.' },
  ],
  extra: 'Siblings ko 10% discount. Study material fees mein included hai.',
}

export default function Setup({ profile, onSave }) {
  const [draft, setDraft] = useState(() => ({ ...emptyProfile, ...profile }))
  const [saved, setSaved] = useState(false)

  const set = (field, value) => {
    setDraft((d) => ({ ...d, [field]: value }))
    setSaved(false)
  }
  const setItem = (list, i, field, value) =>
    set(
      list,
      draft[list].map((item, idx) => (idx === i ? { ...item, [field]: value } : item)),
    )
  const addItem = (list, blank) => set(list, [...draft[list], blank])
  const removeItem = (list, i) => set(list, draft[list].filter((_, idx) => idx !== i))

  function save(e) {
    e.preventDefault()
    onSave(draft)
    setSaved(true)
  }

  const canSave = draft.name.trim() && draft.courses.some((c) => c.name.trim())

  return (
    <form className="page" onSubmit={save}>
      <header className="page-head">
        <div>
          <h1>Business setup</h1>
          <p className="lead">AI sirf yahi details use karega. Jo yahan nahi hai, uske liye woh "team confirm karegi" bolega.</p>
        </div>
        <button type="button" className="btn ghost" onClick={() => (setDraft(SAMPLE), setSaved(false))}>
          Sample data bharein
        </button>
      </header>

      <section className="card">
        <h2>Centre ki jaankari</h2>
        <div className="grid two">
          <label>
            Centre ka naam *
            <input value={draft.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Vidya Classes" required />
          </label>
          <label>
            Contact number
            <input value={draft.phone} onChange={(e) => set('phone', e.target.value)} placeholder="98765 43210" />
          </label>
          <label className="span2">
            Location / address
            <input value={draft.location} onChange={(e) => set('location', e.target.value)} placeholder="Area, landmark, city" />
          </label>
          <label className="span2">
            Office / batch timings
            <input value={draft.timings} onChange={(e) => set('timings', e.target.value)} placeholder="10am–8pm, Mon–Sat" />
          </label>
        </div>
      </section>

      <section className="card">
        <h2>Courses aur fees *</h2>
        {draft.courses.map((c, i) => (
          <div className="repeat" key={i}>
            <div className="grid course">
              <label>
                Course
                <input value={c.name} onChange={(e) => setItem('courses', i, 'name', e.target.value)} placeholder="Class 10 Maths" />
              </label>
              <label>
                Fees
                <input value={c.fee} onChange={(e) => setItem('courses', i, 'fee', e.target.value)} placeholder="₹2,500/month" />
              </label>
              <label>
                Duration
                <input value={c.duration} onChange={(e) => setItem('courses', i, 'duration', e.target.value)} placeholder="1 year" />
              </label>
              <label>
                Batch timing
                <input value={c.timing} onChange={(e) => setItem('courses', i, 'timing', e.target.value)} placeholder="4–6 pm" />
              </label>
              <label className="span-all">
                Notes (optional)
                <input value={c.notes} onChange={(e) => setItem('courses', i, 'notes', e.target.value)} placeholder="Batch size, faculty, material…" />
              </label>
            </div>
            {draft.courses.length > 1 && (
              <button type="button" className="link danger" onClick={() => removeItem('courses', i)}>
                Hatayein
              </button>
            )}
          </div>
        ))}
        <button type="button" className="btn ghost sm" onClick={() => addItem('courses', { name: '', fee: '', duration: '', timing: '', notes: '' })}>
          + Course jodein
        </button>
      </section>

      <section className="card">
        <h2>FAQs</h2>
        <p className="hint">Jo sawaal baar-baar aate hain: demo class, installment, test, transport…</p>
        {draft.faqs.map((f, i) => (
          <div className="repeat" key={i}>
            <div className="grid two">
              <label>
                Sawaal
                <input value={f.q} onChange={(e) => setItem('faqs', i, 'q', e.target.value)} placeholder="Demo class milti hai?" />
              </label>
              <label>
                Jawab
                <input value={f.a} onChange={(e) => setItem('faqs', i, 'a', e.target.value)} placeholder="Haan, 2 free demo classes" />
              </label>
            </div>
            {draft.faqs.length > 1 && (
              <button type="button" className="link danger" onClick={() => removeItem('faqs', i)}>
                Hatayein
              </button>
            )}
          </div>
        ))}
        <button type="button" className="btn ghost sm" onClick={() => addItem('faqs', { q: '', a: '' })}>
          + FAQ jodein
        </button>
      </section>

      <section className="card">
        <h2>Aur kuch?</h2>
        <label>
          Discounts, scholarship, facilities, results…
          <textarea rows={3} value={draft.extra} onChange={(e) => set('extra', e.target.value)} />
        </label>
      </section>

      <div className="sticky-actions">
        <button className="btn primary lg" disabled={!canSave}>
          Save karein
        </button>
        {saved && (
          <span className="saved">
            Saved ✓ <a href="#/reply">Ab jawab banayein →</a>
          </span>
        )}
        {!canSave && <span className="hint">Centre ka naam aur kam se kam ek course zaroori hai.</span>}
      </div>
    </form>
  )
}
