import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { adminLogin } from '../../api/api.js'
import InputField from '../../components/shared/InputField.jsx'
import Button from '../../components/shared/Button.jsx'
import toast from 'react-hot-toast'

export default function AdminLoginPage() {
  const { adminLogin: setAdmin } = useAuth()
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
      const user = await adminLogin(form)
      setAdmin(user)
      toast.success(`Welcome, ${user.fullName}!`)
      navigate('/admin/dashboard')
    } catch(err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={S.page} className="fade-up">
      <div style={S.left}>
        <div>
          <Link to="/" style={S.back}>← Back to Home</Link>
          <div style={S.badge}>🔐 Admin Portal</div>
          <h1 style={S.hero}>Election Control<br/>Center</h1>
          <p style={S.heroSub}>Manage voters, candidates, and monitor your election in real-time from one powerful dashboard.</p>
          <div style={S.infoBox}>
            <p style={S.infoTitle}>Default Credentials</p>
            <p style={S.infoRow}><span>Email</span> admin@voteshield.com</p>
            <p style={S.infoRow}><span>Password</span> admin@123</p>
          </div>
        </div>
      </div>

      <div style={S.right}>
        <div style={S.card}>
          <div style={S.cardTop}>
            <div style={S.cardIcon}>⚙️</div>
            <h2 style={S.title}>Admin Sign In</h2>
            <p style={S.sub}>Access the election management dashboard</p>
          </div>

          <form onSubmit={submit} style={S.form}>
            <InputField label="Admin Email" icon="📧" name="email" type="email"
              placeholder="admin@voteshield.com" value={form.email} onChange={ch}/>

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

            <Button type="submit" variant="admin" fullWidth loading={loading} size="lg">
              {!loading && '→'} Sign in as Admin
            </Button>
          </form>

          <div style={S.divider}/>
          <p style={S.voterLink}>
            Are you a voter?{' '}
            <Link to="/voter/login" style={{ color:'var(--primary)', fontWeight:600, textDecoration:'none' }}>
              Voter Login →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

const S = {
  page: { minHeight:'100vh', display:'flex' },
  left: { flex:1, background:'linear-gradient(145deg,#1E1B4B,#4C1D95,#2E1065)', display:'flex', alignItems:'center', padding:'60px 52px' },
  back: { display:'inline-block', color:'rgba(255,255,255,.6)', fontSize:13, textDecoration:'none', marginBottom:32 },
  badge: { display:'inline-block', background:'rgba(255,255,255,.15)', color:'#fff', fontSize:12, fontWeight:600, padding:'5px 14px', borderRadius:99, marginBottom:20, border:'1px solid rgba(255,255,255,.2)' },
  hero: { fontFamily:'var(--font-h)', fontSize:44, fontWeight:800, color:'#fff', lineHeight:1.15, marginBottom:16 },
  heroSub: { fontSize:15, color:'rgba(255,255,255,.7)', lineHeight:1.75, marginBottom:32 },
  infoBox: { background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.15)', borderRadius:12, padding:'16px 20px' },
  infoTitle: { fontSize:11, fontWeight:700, color:'rgba(255,255,255,.5)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:10 },
  infoRow: { fontSize:13, color:'rgba(255,255,255,.8)', display:'flex', gap:12, marginBottom:4 },
  right: { flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 24px', background:'var(--bg)' },
  card: { background:'var(--surface)', borderRadius:20, padding:'36px', width:'100%', maxWidth:420, boxShadow:'var(--shadow-xl)', border:'1px solid var(--border)' },
  cardTop: { textAlign:'center', marginBottom:28 },
  cardIcon: { fontSize:40, marginBottom:12 },
  title: { fontFamily:'var(--font-h)', fontSize:26, fontWeight:800, color:'var(--text1)', marginBottom:6 },
  sub: { fontSize:14, color:'var(--text3)' },
  form: { display:'flex', flexDirection:'column', gap:18 },
  divider: { height:1, background:'var(--border)', margin:'24px 0' },
  voterLink: { textAlign:'center', fontSize:14, color:'var(--text3)' },
}
