import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useEffect } from 'react'

export default function LandingPage() {
  const { adminUser, voterUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (adminUser) navigate('/admin/dashboard')
    else if (voterUser) navigate('/voter/vote')
  }, [])

  return (
    <div style={S.page} className="fade-up">
      {/* Header */}
      <header style={S.header}>
        <div style={S.logo}>
          <div style={S.logoMark}>VS</div>
          <span style={S.logoText}>VoteShield</span>
        </div>
        <span style={S.headerTag}>Secure • Transparent • Fair</span>
      </header>

      {/* Hero */}
      <main style={S.hero}>
        <div style={S.heroContent}>
          <div style={S.pill}>🗳️ 2025 Digital Election Platform</div>
          <h1 style={S.h1}>Democracy in the<br/>Digital Age</h1>
          <p style={S.heroSub}>
            A secure, tamper-proof online voting system designed for transparent elections.
            Admins manage the process, verified voters cast their ballots.
          </p>

          {/* Entry Cards */}
          <div style={S.cards}>
            {/* Admin */}
            <div style={S.adminCard} onClick={() => navigate('/admin/login')}
              onMouseEnter={e => e.currentTarget.style.transform='translateY(-4px)'}
              onMouseLeave={e => e.currentTarget.style.transform=''}>
              <div style={S.cardIcon('linear-gradient(135deg,#7C3AED,#5B21B6)')}>⚙️</div>
              <div style={S.cardContent}>
                <h3 style={S.cardTitle}>Admin Portal</h3>
                <p style={S.cardDesc}>Manage voters, candidates, and monitor election results in real-time.</p>
                <div style={{ ...S.cardBtn, background:'var(--admin)', color:'#fff' }}>
                  Admin Login →
                </div>
              </div>
            </div>

            {/* Voter */}
            <div style={S.voterCard} onClick={() => navigate('/voter/login')}
              onMouseEnter={e => e.currentTarget.style.transform='translateY(-4px)'}
              onMouseLeave={e => e.currentTarget.style.transform=''}>
              <div style={S.cardIcon('linear-gradient(135deg,#3B5BDB,#2F4AC0)')}>🗳️</div>
              <div style={S.cardContent}>
                <h3 style={S.cardTitle}>Voter Portal</h3>
                <p style={S.cardDesc}>Cast your secure ballot. Your identity is verified, your vote is anonymous.</p>
                <div style={{ ...S.cardBtn, background:'var(--primary)', color:'#fff' }}>
                  Voter Login →
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div style={S.features}>
          {[
            { icon: '🔒', title: 'Secure Authentication', desc: 'Separate portals for admins and voters' },
            { icon: '🛡️', title: 'One Vote Per Voter',   desc: 'System prevents duplicate voting' },
            { icon: '📊', title: 'Live Results',          desc: 'Real-time election dashboard' },
            { icon: '👤', title: 'Admin Controlled',      desc: 'Only admin can register voters' },
          ].map(f => (
            <div key={f.title} style={S.feature}>
              <span style={{ fontSize: 24 }}>{f.icon}</span>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text1)', marginBottom: 2 }}>{f.title}</p>
                <p style={{ fontSize: 13, color: 'var(--text3)' }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer style={S.footer}>
        <p>VoteShield v2.0 — Built with Spring Boot + React</p>
        <p style={{ marginTop: 4, fontSize: 12 }}>Admin: admin@voteshield.com / admin@123</p>
      </footer>
    </div>
  )
}

const S = {
  page: { minHeight: '100vh', background: 'linear-gradient(160deg,#EEF2FF 0%,#F0F4FF 50%,#F8F4FF 100%)', display: 'flex', flexDirection: 'column' },
  header: { padding: '20px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(59,91,219,.1)' },
  logo: { display: 'flex', alignItems: 'center', gap: 10 },
  logoMark: { width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#3B5BDB,#7C3AED)', color: '#fff', fontFamily: 'var(--font-h)', fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontFamily: 'var(--font-h)', fontWeight: 800, fontSize: 20, color: 'var(--text1)', letterSpacing: '-.3px' },
  headerTag: { fontSize: 13, color: 'var(--text3)', fontWeight: 500 },
  hero: { flex: 1, maxWidth: 960, margin: '0 auto', padding: '60px 24px', width: '100%' },
  heroContent: { textAlign: 'center', marginBottom: 48 },
  pill: { display: 'inline-block', background: 'white', border: '1px solid var(--border)', color: 'var(--text3)', fontSize: 13, fontWeight: 500, padding: '6px 16px', borderRadius: 99, marginBottom: 24, boxShadow: 'var(--shadow-sm)' },
  h1: { fontFamily: 'var(--font-h)', fontSize: 56, fontWeight: 800, color: 'var(--text1)', lineHeight: 1.1, marginBottom: 20, letterSpacing: '-.5px' },
  heroSub: { fontSize: 18, color: 'var(--text3)', lineHeight: 1.7, marginBottom: 40, maxWidth: 560, margin: '0 auto 40px' },
  cards: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 720, margin: '0 auto' },
  adminCard: { background: 'white', border: '2px solid rgba(124,58,237,.2)', borderRadius: 20, padding: '28px', cursor: 'pointer', transition: 'all .2s', boxShadow: '0 4px 24px rgba(124,58,237,.08)', textAlign: 'left' },
  voterCard: { background: 'white', border: '2px solid rgba(59,91,219,.2)', borderRadius: 20, padding: '28px', cursor: 'pointer', transition: 'all .2s', boxShadow: '0 4px 24px rgba(59,91,219,.08)', textAlign: 'left' },
  cardIcon: bg => ({ width: 52, height: 52, borderRadius: 14, background: bg, fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }),
  cardContent: {},
  cardTitle: { fontFamily: 'var(--font-h)', fontSize: 20, fontWeight: 700, color: 'var(--text1)', marginBottom: 8 },
  cardDesc: { fontSize: 14, color: 'var(--text3)', lineHeight: 1.6, marginBottom: 20 },
  cardBtn: { display: 'inline-block', padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600 },
  features: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 },
  feature: { background: 'white', border: '1px solid var(--border)', borderRadius: 14, padding: '16px', display: 'flex', alignItems: 'flex-start', gap: 12, boxShadow: 'var(--shadow-sm)' },
  footer: { padding: '20px', textAlign: 'center', fontSize: 13, color: 'var(--text4)', borderTop: '1px solid var(--border)' },
}
