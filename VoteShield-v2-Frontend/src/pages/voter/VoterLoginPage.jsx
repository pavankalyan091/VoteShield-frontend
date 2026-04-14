import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { voterLogin } from '../../api/api.js'
import InputField from '../../components/shared/InputField.jsx'
import Button from '../../components/shared/Button.jsx'
import toast from 'react-hot-toast'

export default function VoterLoginPage() {
  const { voterLogin: setVoter } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const ch = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    if (!form.email || !form.password) { toast.error('Please fill all fields'); return }
    setLoading(true)
    try {
      const user = await voterLogin(form)
      setVoter(user)
      toast.success(`Welcome, ${user.fullName}!`)
      navigate(user.hasVoted ? '/voter/results' : '/voter/vote')
    } catch(err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={S.page} className="fade-up">
      <div style={S.left}>
        <div>
          <Link to="/" style={S.back}>← Back to Home</Link>
          <div style={S.badge}>🗳️ Voter Portal</div>
          <h1 style={S.hero}>Cast Your<br/>Vote Securely</h1>
          <p style={S.heroSub}>Your identity is verified by the election committee. Login with credentials provided by your admin.</p>
          <div style={S.steps}>
            {[
              { n:'1', t:'Login',  d:'Use credentials given by admin' },
              { n:'2', t:'Choose', d:'Select your preferred candidate' },
              { n:'3', t:'Confirm',d:'Review and confirm your vote' },
              { n:'4', t:'Done',   d:'View live results instantly' },
            ].map(s => (
              <div key={s.n} style={S.step}>
                <div style={S.stepNum}>{s.n}</div>
                <div>
                  <p style={S.stepTitle}>{s.t}</p>
                  <p style={S.stepDesc}>{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={S.right}>
        <div style={S.card}>
          <div style={S.cardTop}>
            <div style={S.cardIcon}>🗳️</div>
            <h2 style={S.title}>Voter Sign In</h2>
            <p style={S.sub}>Enter credentials provided by your election admin</p>
          </div>

          <form onSubmit={submit} style={S.form}>
            <InputField label="Email Address" icon="📧" name="email" type="email"
              placeholder="your@email.com" value={form.email} onChange={ch}/>

            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <label style={{ fontSize:13, fontWeight:600, color:'var(--text2)' }}>Password</label>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:16 }}>🔒</span>
                <input name="password" type={showPw?'text':'password'}
                  placeholder="••••••••" value={form.password} onChange={ch}/>
                <button type="button" onClick={() => setShowPw(p=>!p)}
                  style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:14, color:'var(--text3)' }}>
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <Button type="submit" variant="primary" fullWidth loading={loading} size="lg">
              {!loading && '→'} Sign in to Vote
            </Button>
          </form>

          <div style={S.notice}>
            <span style={{ fontSize:16 }}>ℹ️</span>
            <p style={{ fontSize:13, color:'var(--text3)', lineHeight:1.5 }}>
              Don't have credentials? Contact your election administrator to get registered.
            </p>
          </div>

          <div style={S.divider}/>
          <p style={S.adminLink}>
            Are you an admin?{' '}
            <Link to="/admin/login" style={{ color:'var(--admin)', fontWeight:600, textDecoration:'none' }}>
              Admin Login →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

const S = {
  page: { minHeight:'100vh', display:'flex' },
  left: { flex:1, background:'linear-gradient(145deg,#1E3A8A,#1D4ED8,#0369A1)', display:'flex', alignItems:'center', padding:'60px 52px' },
  back: { display:'inline-block', color:'rgba(255,255,255,.6)', fontSize:13, textDecoration:'none', marginBottom:32 },
  badge: { display:'inline-block', background:'rgba(255,255,255,.15)', color:'#fff', fontSize:12, fontWeight:600, padding:'5px 14px', borderRadius:99, marginBottom:20, border:'1px solid rgba(255,255,255,.2)' },
  hero: { fontFamily:'var(--font-h)', fontSize:44, fontWeight:800, color:'#fff', lineHeight:1.15, marginBottom:16 },
  heroSub: { fontSize:15, color:'rgba(255,255,255,.7)', lineHeight:1.75, marginBottom:32 },
  steps: { display:'flex', flexDirection:'column', gap:14 },
  step: { display:'flex', alignItems:'flex-start', gap:14 },
  stepNum: { width:28, height:28, borderRadius:'50%', background:'rgba(255,255,255,.2)', color:'#fff', fontSize:13, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 },
  stepTitle: { fontSize:14, fontWeight:600, color:'#fff', marginBottom:2 },
  stepDesc: { fontSize:13, color:'rgba(255,255,255,.65)' },
  right: { flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 24px', background:'var(--bg)' },
  card: { background:'var(--surface)', borderRadius:20, padding:'36px', width:'100%', maxWidth:420, boxShadow:'var(--shadow-xl)', border:'1px solid var(--border)' },
  cardTop: { textAlign:'center', marginBottom:28 },
  cardIcon: { fontSize:40, marginBottom:12 },
  title: { fontFamily:'var(--font-h)', fontSize:26, fontWeight:800, color:'var(--text1)', marginBottom:6 },
  sub: { fontSize:14, color:'var(--text3)' },
  form: { display:'flex', flexDirection:'column', gap:18 },
  notice: { display:'flex', gap:10, alignItems:'flex-start', background:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:10, padding:'12px 14px', marginTop:16 },
  divider: { height:1, background:'var(--border)', margin:'24px 0' },
  adminLink: { textAlign:'center', fontSize:14, color:'var(--text3)' },
}
