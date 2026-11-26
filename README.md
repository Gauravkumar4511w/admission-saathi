# Admission Saathi — AI admission assistant (MVP)

Coaching centres ke liye: parent/student ka sawaal paste karo, AI WhatsApp par bhejne layak jawab banata hai, aur follow-up yaad dilata hai.

## Chalane ke liye

1. `npm install`
2. `npm run dev` → http://localhost:5173
3. AI Reply page par "AI connect karein" box mein Anthropic API key paste karein (platform.claude.com → API keys).
   Yeh key `.env` mein save hoti hai (git mein nahi jaati). Chahein to `.env` khud bhi likh sakte hain:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```
   Account mein credits hone chahiye, warna "credits khaali hain" message aayega.

Production: `npm run build && npm start` (port 3000, ya `PORT` env).

## Deploy (Render)

`render.yaml` repo mein hai. Render dashboard → **New → Blueprint** → yeh GitHub repo chunein →
`ANTHROPIC_API_KEY` ki value daalein → **Apply**. Free plan par 15 min koi visit na ho to app so jaata hai;
agli visit par ~1 min mein jaagta hai.

Har IP se ek ghante mein max 40 AI requests (`AI_RATE_LIMIT_PER_HOUR`), taaki public link se credits na udein.

## Kya hai MVP mein

| Page | Kaam |
|---|---|
| Home (`#/`) | "Admission inquiries ka jawab seconds mein" + Free try karein |
| Setup (`#/setup`) | Centre ka naam, courses, fees, timings, location, FAQs ("Sample data bharein" se jaldi try) |
| AI Reply (`#/reply`) | Sawaal paste → Hinglish / Hindi / English jawab → Copy ya WhatsApp mein kholein → inquiry ka naam + follow-up date save |
| Follow-ups (`#/followups`) | Aaj / late / aage ke follow-ups, AI follow-up draft, "Bhej diya" se agli date, Joined / Not interested |
| Pricing (`#/pricing`) | Free trial + ek paid plan (abhi sirf display; payment nahi) |

## Kaise bana hai

- React + Vite frontend. Data (profile, inquiries) browser ke `localStorage` mein — koi database nahi.
- `server/api.js`: `/api/reply` aur `/api/followup`, Claude (`claude-opus-5-5`, low effort) se message banata hai. API key sirf server par rehti hai. Dev mein Vite ke andar chalta hai, production mein `server/index.js`.
- WhatsApp auto-connect nahi hai: copy-paste ya `wa.me` link.

## Abhi nahi hai (agle version ke liye)

Login/accounts, server-side database, trial limit enforce karna, payment, WhatsApp Business API.
