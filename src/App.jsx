import { useEffect, useState } from 'react'
import { isProfileReady, todayISO, useInquiries, useLanguage, useProfile } from './store.js'
import Home from './pages/Home.jsx'
import Setup from './pages/Setup.jsx'
import Reply from './pages/Reply.jsx'
import Followups from './pages/Followups.jsx'
import Pricing from './pages/Pricing.jsx'

const NAV = [
  { path: '/setup', label: 'Setup' },
  { path: '/reply', label: 'AI Reply' },
  { path: '/followups', label: 'Follow-ups' },
  { path: '/pricing', label: 'Pricing' },
]

function useRoute() {
  const get = () => window.location.hash.replace(/^#/, '') || '/'
  const [route, setRoute] = useState(get)
  useEffect(() => {
    const onChange = () => {
      setRoute(get())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}

export default function App() {
  const route = useRoute()
  const [profile, setProfile] = useProfile()
  const [inquiries, setInquiries] = useInquiries()
  const [language, setLanguage] = useLanguage()
  const [aiReady, setAiReady] = useState(null)
  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((d) => setAiReady(Boolean(d.aiReady)))
      .catch(() => setAiReady(null))
  }, [])
  const ready = isProfileReady(profile)
  const today = todayISO()
  const dueCount = inquiries.filter((q) => q.status === 'open' && q.followUpDate <= today).length

  let page
  switch (route) {
    case '/setup':
      page = <Setup profile={profile} onSave={setProfile} />
      break
    case '/reply':
      page = (
        <Reply
          profile={profile}
          ready={ready}
          aiReady={aiReady}
          onAiConnected={() => setAiReady(true)}
          language={language}
          setLanguage={setLanguage}
          onSaveInquiry={(q) => setInquiries((list) => [q, ...list])}
        />
      )
      break
    case '/followups':
      page = (
        <Followups
          profile={profile}
          inquiries={inquiries}
          setInquiries={setInquiries}
          language={language}
          setLanguage={setLanguage}
        />
      )
      break
    case '/pricing':
      page = <Pricing />
      break
    default:
      page = <Home ready={ready} dueCount={dueCount} inquiryCount={inquiries.length} />
  }

  return (
    <>
      <nav className="topbar">
        <div className="topbar-inner">
          <a href="#/" className="brand">
            <span className="logo">स</span> Admission Saathi
          </a>
          <div className="nav-links">
            {NAV.map((n) => (
              <a key={n.path} href={`#${n.path}`} className={route === n.path ? 'active' : ''}>
                {n.label}
                {n.path === '/followups' && dueCount > 0 && <span className="dot">{dueCount}</span>}
              </a>
            ))}
          </div>
        </div>
      </nav>
      <main>{page}</main>
      <footer className="footer">Admission Saathi · MVP · Data sirf aapke browser mein save hota hai</footer>
    </>
  )
}
