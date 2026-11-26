// Shared API handler: used by the Vite dev server (vite.config.js) and the
// production server (server/index.js). Keeps the Anthropic key on the server.
import Anthropic from '@anthropic-ai/sdk'

const MODEL = 'claude-opus-5-5'

const LANGUAGE_RULES = {
  hindi:
    'Reply in simple, polite Hindi written in Devanagari script. Course names, fees and timings can stay as numbers/English words where natural.',
  english: 'Reply in simple, polite Indian English.',
  hinglish:
    'Reply in Hinglish (Hindi written in Roman/English letters, mixed with common English words), the way coaching centres usually chat on WhatsApp.',
}

let client = null
function getClient() {
  if (!client) client = new Anthropic()
  return client
}

function hasCredentials() {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN)
}

function describeProfile(p = {}) {
  const courses = (p.courses || [])
    .filter((c) => c.name)
    .map(
      (c) =>
        `- ${c.name}${c.fee ? ` | Fee: ${c.fee}` : ''}${c.duration ? ` | Duration: ${c.duration}` : ''}${c.timing ? ` | Timing: ${c.timing}` : ''}${c.notes ? ` | Notes: ${c.notes}` : ''}`,
    )
    .join('\n')
  const faqs = (p.faqs || [])
    .filter((f) => f.q && f.a)
    .map((f) => `Q: ${f.q}\nA: ${f.a}`)
    .join('\n\n')
  return [
    `Centre name: ${p.name || '(not set)'}`,
    p.location ? `Location / address: ${p.location}` : null,
    p.phone ? `Contact number: ${p.phone}` : null,
    p.timings ? `Office / batch timings: ${p.timings}` : null,
    courses ? `Courses:\n${courses}` : 'Courses: (none saved)',
    faqs ? `FAQs:\n${faqs}` : null,
    p.extra ? `Other details: ${p.extra}` : null,
  ]
    .filter(Boolean)
    .join('\n')
}

function systemPrompt(profile, language) {
  return `You write WhatsApp messages for an Indian coaching centre's admission desk. The messages go to parents and students who asked about admission.

Centre details (the only facts you may use):
${describeProfile(profile)}

How to write:
- ${LANGUAGE_RULES[language] || LANGUAGE_RULES.english}
- Sound like a friendly, trustworthy admission counsellor, not a bot. Warm, respectful ("aap"), short.
- Keep it WhatsApp-sized: usually 4-8 short lines. Use line breaks; at most 1-2 emojis; *bold* only for key facts like fees.
- Answer exactly what was asked using the centre details. If a detail is not in the centre details, do not invent it: say the team will confirm, and invite them to call or visit.
- End with one clear next step (e.g. free demo class, visit the centre, call back), worded as an invitation.
- Output only the message text, ready to paste. No preamble, no quotes, no notes to the operator.`
}

async function generate({ profile, language, prompt }) {
  const response = await getClient().beta.messages.create({
    model: MODEL,
    max_tokens: 4096,
    output_config: { effort: 'low' },
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    system: systemPrompt(profile, language),
    messages: [{ role: 'user', content: prompt }],
  })
  if (response.stop_reason === 'refusal') {
    const err = new Error('AI ne yeh message banane se mana kar diya. Sawaal thoda badal kar dobara try karein.')
    err.status = 422
    throw err
  }
  const text = response.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim()
  if (!text) {
    const err = new Error('AI se khaali jawab aaya. Dobara try karein.')
    err.status = 502
    throw err
  }
  return text
}

function replyPrompt({ question, studentName }) {
  return `A parent/student${studentName ? ` named ${studentName}` : ''} sent this admission inquiry on WhatsApp:

"""
${question}
"""

Write the reply message.`
}

function followupPrompt({ inquiry }) {
  const days = inquiry.createdAt
    ? Math.max(0, Math.round((Date.now() - new Date(inquiry.createdAt).getTime()) / 86400000))
    : null
  return `Write a follow-up WhatsApp message to ${inquiry.name || 'a parent/student'} who asked about admission${days !== null ? ` ${days} day(s) ago` : ''} and has not joined yet.

Their original question: """${inquiry.question || '(not recorded)'}"""
${inquiry.course ? `Course they were interested in: ${inquiry.course}` : ''}
${inquiry.lastReply ? `What we replied earlier: """${inquiry.lastReply}"""` : ''}
${inquiry.note ? `Operator note: ${inquiry.note}` : ''}

Make it a gentle reminder, not pushy: greet them by name, recall their interest, add one useful reason to act now only if it is supported by the centre details (e.g. batch timing, demo class), and ask a simple yes/no question to restart the chat.`
}

// Simple per-IP limit so a public deployment can't burn through the API credits.
const RATE_LIMIT = Number(process.env.AI_RATE_LIMIT_PER_HOUR) || 40
const hits = new Map()
function rateLimited(req) {
  const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '')
    .split(',')[0]
    .trim()
  const now = Date.now()
  const recent = (hits.get(ip) || []).filter((t) => now - t < 3_600_000)
  if (recent.length >= RATE_LIMIT) {
    hits.set(ip, recent)
    return true
  }
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) hits.clear()
  return false
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
      if (body.length > 100_000) reject(Object.assign(new Error('Request too large'), { status: 413 }))
    })
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch {
        reject(Object.assign(new Error('Invalid JSON'), { status: 400 }))
      }
    })
    req.on('error', reject)
  })
}

function send(res, status, data) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(data))
}

/**
 * Dev-only: lets the owner paste their API key into the app instead of editing .env.
 * Mounted only by the Vite dev server (localhost), never by server/index.js.
 */
export async function handleKeySetup(req, res, envPath) {
  if (req.method !== 'POST' || req.url.split('?')[0] !== '/api/setup-key') return false
  try {
    const { key } = await readJson(req)
    const clean = String(key || '').replace(/[\s"']/g, '')
    if (!/^sk-ant-[A-Za-z0-9_-]{20,}$/.test(clean)) {
      send(res, 400, { error: 'Yeh Anthropic API key nahi lagti. Key "sk-ant-" se shuru hoti hai.' })
      return true
    }
    const { readFile, writeFile } = await import('node:fs/promises')
    let lines = []
    try {
      lines = (await readFile(envPath, 'utf8')).split('\n').filter((l) => l && !l.startsWith('ANTHROPIC_API_KEY='))
    } catch {
      /* no .env yet */
    }
    await writeFile(envPath, [`ANTHROPIC_API_KEY=${clean}`, ...lines].join('\n') + '\n', { mode: 0o600 })
    process.env.ANTHROPIC_API_KEY = clean
    client = null
    send(res, 200, { ok: true })
  } catch (error) {
    send(res, error.status || 500, { error: error.message || 'Key save nahi ho payi.' })
  }
  return true
}

/** Connect-style middleware. Returns true if it handled the request. */
export async function handleApi(req, res) {
  const url = req.url.split('?')[0]
  if (url === '/api/health') {
    send(res, 200, { ok: true, aiReady: hasCredentials() })
    return true
  }
  if (req.method !== 'POST' || (url !== '/api/reply' && url !== '/api/followup')) return false

  try {
    if (!hasCredentials()) {
      send(res, 503, {
        error: 'AI abhi set nahi hai: server par ANTHROPIC_API_KEY daalein (.env file mein) aur server restart karein.',
      })
      return true
    }
    if (rateLimited(req)) {
      send(res, 429, { error: 'Is ghante ki limit poori ho gayi. Thodi der baad try karein.' })
      return true
    }
    const body = await readJson(req)
    const language = ['hindi', 'english', 'hinglish'].includes(body.language) ? body.language : 'english'

    const isReply = url === '/api/reply'
    if (isReply ? !body.question?.trim() : !body.inquiry) {
      send(res, 400, { error: isReply ? 'Sawaal khaali hai.' : 'Inquiry missing.' })
      return true
    }
    const prompt = isReply ? replyPrompt(body) : followupPrompt(body)

    const text = await generate({ profile: body.profile, language, prompt })
    send(res, 200, { text })
  } catch (error) {
    let status = error.status || 500
    let message = error.message || 'Kuch gadbad ho gayi.'
    if (error instanceof Anthropic.AuthenticationError) {
      status = 503
      message = 'API key galat hai. .env mein ANTHROPIC_API_KEY check karein.'
    } else if (error instanceof Anthropic.RateLimitError) {
      status = 429
      message = 'Abhi bahut requests aa rahi hain. Thodi der baad try karein.'
    } else if (error instanceof Anthropic.APIConnectionError) {
      status = 502
      message = 'AI service se connect nahi ho paya. Internet check karke dobara try karein.'
    } else if (error instanceof Anthropic.BadRequestError && /credit balance/i.test(error.message)) {
      status = 402
      message = 'Anthropic account mein credits khatam/khaali hain. platform.claude.com → Billing mein credits add karein, phir dobara try karein.'
    } else if (error instanceof Anthropic.APIError) {
      console.error('Anthropic API error', error.status, error.message)
      status = 502
      message = 'AI service mein dikkat aayi. Dobara try karein.'
    } else if (status >= 500) {
      console.error(error)
    }
    send(res, status, { error: message })
  }
  return true
}
