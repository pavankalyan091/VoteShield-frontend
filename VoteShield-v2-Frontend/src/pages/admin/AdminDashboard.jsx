import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import * as api from '../../api/api.js'
import StatCard from '../../components/shared/StatCard.jsx'
import Button from '../../components/shared/Button.jsx'
import Badge from '../../components/shared/Badge.jsx'
import Spinner from '../../components/shared/Spinner.jsx'
import EmptyState from '../../components/shared/EmptyState.jsx'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import toast from 'react-hot-toast'

const TABS = ['Overview', 'Voters', 'Candidates', 'Results']
const BAR_COLORS = ['#3B5BDB','#7C3AED','#F59E0B','#10B981','#EF4444']

export default function AdminDashboard() {
  const { adminUser, adminLogout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('Overview')
  const [stats, setStats] = useState(null)
  const [voters, setVoters] = useState([])
  const [candidates, setCandidates] = useState([])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  // Add voter form — password లేదు, system auto-generate చేస్తుంది
  const [voterForm, setVoterForm] = useState({ fullName: '', email: '' })
  const [addingVoter, setAddingVoter] = useState(false)
  const [showVoterForm, setShowVoterForm] = useState(false)

  // Add candidate form
  const [candForm, setCandForm] = useState({ name: '', partyName: '', partySymbol: '' })
  const [addingCand, setAddingCand] = useState(false)
  const [showCandForm, setShowCandForm] = useState(false)

  // FIX: [adminUser] — re-login తర్వాత కూడా data load అవుతుంది
  useEffect(() => {
    if (!adminUser) { navigate('/admin/login'); return }
    loadAll()
  }, [adminUser])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [s, v, c, r] = await Promise.all([
        api.getStats(), api.getAllVoters(),
        api.getAllCandidates(), api.getResults()
      ])
      setStats(s); setVoters(v); setCandidates(c); setResults(r)
    } catch { toast.error('Failed to load data') }
    finally { setLoading(false) }
  }

  const handleAddVoter = async e => {
    e.preventDefault()
    if (!voterForm.fullName || !voterForm.email) { toast.error('Fill all fields'); return }
    setAddingVoter(true)
    try {
      await api.createVoter(voterForm)
      toast.success('Voter registered! Credentials sent to their email.')
      setVoterForm({ fullName: '', email: '' })
      setShowVoterForm(false)
      loadAll()
    } catch (err) { toast.error(err.message) }
    finally { setAddingVoter(false) }
  }

  const handleDeleteVoter = async id => {
    if (!confirm('Delete this voter?')) return
    try { await api.deleteVoter(id); toast.success('Voter removed'); loadAll() }
    catch (err) { toast.error(err.message) }
  }

  const handleAddCandidate = async e => {
    e.preventDefault()
    if (!candForm.name || !candForm.partyName) { toast.error('Fill all fields'); return }
    setAddingCand(true)
    try {
      await api.createCandidate(candForm)
      toast.success('Candidate added!')
      setCandForm({ name: '', partyName: '', partySymbol: '' })
      setShowCandForm(false)
      loadAll()
    } catch (err) { toast.error(err.message) }
    finally { setAddingCand(false) }
  }

  const handleDeleteCandidate = async id => {
    if (!confirm('Delete this candidate?')) return
    try { await api.deleteCandidate(id); toast.success('Candidate removed'); loadAll() }
    catch (err) { toast.error(err.message) }
  }

  const handleLogout = () => { adminLogout(); navigate('/') }

  return (
    <div style={S.layout}>
      {/* Sidebar */}
      <aside style={S.sidebar}>
        <div style={S.sideTop}>
          <div style={S.sideLogo}>
            <div style={S.logoMark}>VS</div>
            <div>
              <p style={S.logoName}>VoteShield</p>
              <p style={S.logoSub}>Admin Panel</p>
            </div>
          </div>
          <div style={S.adminBadge}>
            <div style={S.adminAvatar}>{adminUser?.fullName?.charAt(0)}</div>
            <div>
              <p style={S.adminName}>{adminUser?.fullName}</p>
              <p style={S.adminRole}>Administrator</p>
            </div>
          </div>
          <nav style={S.nav}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{ ...S.navItem, ...(tab === t ? S.navActive : {}) }}>
                {{ Overview:'📊', Voters:'👥', Candidates:'🏛️', Results:'🏆' }[t]} {t}
              </button>
            ))}
          </nav>
        </div>
        <button onClick={handleLogout} style={S.logoutBtn}>↩ Logout</button>
      </aside>

      {/* Main */}
      <main style={S.main}>
        <div style={S.topBar}>
          <div>
            <h1 style={S.pageTitle}>{tab}</h1>
            <p style={S.pageDesc}>
              {{ Overview:'Election at a glance', Voters:'Manage registered voters',
                 Candidates:'Manage election candidates', Results:'Live election results' }[tab]}
            </p>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            {tab === 'Voters'     && <Button variant="admin" onClick={() => setShowVoterForm(p => !p)}>+ Add Voter</Button>}
            {tab === 'Candidates' && <Button variant="admin" onClick={() => setShowCandForm(p => !p)}>+ Add Candidate</Button>}
            <Button variant="ghost" onClick={loadAll}>🔄 Refresh</Button>
          </div>
        </div>

        {loading ? <Spinner /> : (
          <div className="fade-up">

            {/* ── OVERVIEW ── */}
            {tab === 'Overview' && stats && (
              <div>
                <div style={S.statsGrid}>
                  <StatCard label="Registered Voters"  value={stats.totalVoters}     icon="👥" bg="#EEF2FF"/>
                  <StatCard label="Candidates"          value={stats.totalCandidates} icon="🏛️" bg="#F5F3FF"/>
                  <StatCard label="Votes Cast"          value={stats.votedCount}      icon="🗳️" bg="#F0FDF4"/>
                  <StatCard label="Turnout" icon="📊" bg="#FFFBEB"
                    value={stats.totalVoters > 0
                      ? `${Math.round((stats.votedCount / stats.totalVoters) * 100)}%`
                      : '0%'}
                  />
                </div>
                {results.length > 0 && (
                  <div style={S.chartCard}>
                    <h3 style={S.cardTitle}>Vote Distribution</h3>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={results} margin={{ top:8, right:16, left:0, bottom:0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false}/>
                        <XAxis dataKey="name" tick={{ fontSize:12, fill:'#64748B' }} axisLine={false} tickLine={false}/>
                        <YAxis allowDecimals={false} tick={{ fontSize:12, fill:'#64748B' }} axisLine={false} tickLine={false}/>
                        <Tooltip
                          contentStyle={{ background:'#0F172A', color:'#fff', border:'none', borderRadius:10, fontSize:13 }}
                          formatter={v => [`${v} votes`, '']}/>
                        <Bar dataKey="voteCount" radius={[6,6,0,0]} maxBarSize={60}>
                          {results.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]}/>)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}

            {/* ── VOTERS ── */}
            {tab === 'Voters' && (
              <div>
                {showVoterForm && (
                  <div style={S.formCard}>
                    <h3 style={S.cardTitle}>Register New Voter</h3>
                    <p style={S.formNote}>
                      🔒 Password is auto-generated and sent to voter's email. Admin never sees it.
                    </p>
                    <form onSubmit={handleAddVoter} style={S.formGrid}>
                      <FormInput label="Full Name" placeholder="Voter full name"
                        value={voterForm.fullName}
                        onChange={e => setVoterForm(p => ({ ...p, fullName: e.target.value }))}/>
                      <FormInput label="Email Address" type="email" placeholder="voter@email.com"
                        value={voterForm.email}
                        onChange={e => setVoterForm(p => ({ ...p, email: e.target.value }))}/>
                      <div style={{ display:'flex', gap:8, alignSelf:'flex-end' }}>
                        <Button type="submit" variant="admin" loading={addingVoter}>
                          {!addingVoter && '📧'} Register & Send Email
                        </Button>
                        <Button type="button" variant="ghost" onClick={() => setShowVoterForm(false)}>Cancel</Button>
                      </div>
                    </form>
                  </div>
                )}
                <div style={S.tableCard}>
                  <p style={S.tableTitle}>All Voters ({voters.length})</p>
                  {voters.length === 0
                    ? <EmptyState icon="👥" title="No voters registered" message="Add voters using the button above"/>
                    : (
                      <table className="vs-table">
                        <thead><tr>
                          <th>Voter</th><th>Email</th><th>Voter ID</th><th>Status</th><th>Action</th>
                        </tr></thead>
                        <tbody>
                          {voters.map(v => (
                            <tr key={v.id}>
                              <td><AvatarCell name={v.fullName}/></td>
                              <td style={{ color:'var(--text3)' }}>{v.email}</td>
                              <td>
                                <span style={{ fontFamily:'monospace', fontSize:13,
                                  background:'#F1F5F9', padding:'2px 8px', borderRadius:6 }}>
                                  {v.voterId || '—'}
                                </span>
                              </td>
                              <td>
                                {v.hasVoted
                                  ? <Badge variant="green">✓ Voted</Badge>
                                  : <Badge variant="yellow">Pending</Badge>}
                              </td>
                              <td>
                                <Button variant="danger" size="sm"
                                  onClick={() => handleDeleteVoter(v.id)}
                                  disabled={v.hasVoted}
                                  title={v.hasVoted ? 'Cannot delete a voter who has voted' : ''}>
                                  Remove
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                </div>
              </div>
            )}

            {/* ── CANDIDATES ── */}
            {tab === 'Candidates' && (
              <div>
                {showCandForm && (
                  <div style={S.formCard}>
                    <h3 style={S.cardTitle}>Add New Candidate</h3>
                    <form onSubmit={handleAddCandidate} style={S.formGrid}>
                      <FormInput label="Full Name" placeholder="Candidate Name"
                        value={candForm.name}
                        onChange={e => setCandForm(p => ({ ...p, name: e.target.value }))}/>
                      <FormInput label="Party Name" placeholder="Party Name"
                        value={candForm.partyName}
                        onChange={e => setCandForm(p => ({ ...p, partyName: e.target.value }))}/>
                      <FormInput label="Party Symbol (emoji)" placeholder="🌟"
                        value={candForm.partySymbol}
                        onChange={e => setCandForm(p => ({ ...p, partySymbol: e.target.value }))}/>
                      <div style={{ display:'flex', gap:8, alignSelf:'flex-end' }}>
                        <Button type="submit" variant="admin" loading={addingCand}>Add Candidate</Button>
                        <Button type="button" variant="ghost" onClick={() => setShowCandForm(false)}>Cancel</Button>
                      </div>
                    </form>
                  </div>
                )}
                <div style={S.tableCard}>
                  <p style={S.tableTitle}>All Candidates ({candidates.length})</p>
                  {candidates.length === 0
                    ? <EmptyState icon="🏛️" title="No candidates added" message="Add candidates using the button above"/>
                    : (
                      <table className="vs-table">
                        <thead><tr>
                          <th>Candidate</th><th>Party</th><th>Symbol</th><th>Votes</th><th>Action</th>
                        </tr></thead>
                        <tbody>
                          {candidates.map(c => (
                            <tr key={c.id}>
                              <td><AvatarCell name={c.name} color="#3B5BDB"/></td>
                              <td style={{ color:'var(--text3)' }}>{c.partyName}</td>
                              <td style={{ fontSize:22 }}>{c.partySymbol}</td>
                              <td><Badge variant="blue">{c.voteCount} votes</Badge></td>
                              <td>
                                <Button variant="danger" size="sm"
                                  onClick={() => handleDeleteCandidate(c.id)}>
                                  Remove
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                </div>
              </div>
            )}

            {/* ── RESULTS ── */}
            {tab === 'Results' && (
              <div>
                {results.length === 0
                  ? <EmptyState icon="🏆" title="No votes yet" message="Results will appear once voting begins"/>
                  : (
                    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                      {results[0]?.voteCount > 0 && (
                        <div style={S.leaderCard}>
                          <span style={{ fontSize:36 }}>👑</span>
                          <div style={{ flex:1 }}>
                            <p style={{ fontSize:11, fontWeight:700, color:'#92400E',
                              textTransform:'uppercase', letterSpacing:'.06em', marginBottom:4 }}>
                              Current Leader
                            </p>
                            <p style={{ fontSize:22, fontWeight:800, color:'var(--text1)',
                              fontFamily:'var(--font-h)', marginBottom:2 }}>
                              {results[0].name}
                            </p>
                            <p style={{ fontSize:14, color:'var(--text3)' }}>{results[0].partyName}</p>
                          </div>
                          <div style={{ textAlign:'right' }}>
                            <p style={{ fontSize:40, fontWeight:800, color:'#B45309',
                              fontFamily:'var(--font-h)', lineHeight:1 }}>
                              {results[0].voteCount}
                            </p>
                            <p style={{ fontSize:12, color:'#92400E' }}>votes</p>
                          </div>
                        </div>
                      )}
                      <div style={S.tableCard}>
                        <table className="vs-table">
                          <thead><tr>
                            <th>Rank</th><th>Candidate</th><th>Party</th><th>Votes</th><th>Share</th>
                          </tr></thead>
                          <tbody>
                            {results.map((c, i) => {
                              const total = results.reduce((s, x) => s + x.voteCount, 0)
                              const pct = total > 0 ? ((c.voteCount / total) * 100).toFixed(1) : '0.0'
                              return (
                                <tr key={c.id}>
                                  <td style={{ fontWeight:700, color: i===0 ? '#B45309' : 'var(--text3)',
                                    fontFamily:'var(--font-h)', fontSize:18 }}>
                                    {i===0 && c.voteCount > 0 ? '🥇' : i+1}
                                  </td>
                                  <td><AvatarCell name={c.name} color="#3B5BDB"/></td>
                                  <td><Badge variant="blue">{c.partyName}</Badge></td>
                                  <td style={{ fontWeight:700, fontSize:16, color:'var(--text1)' }}>
                                    {c.voteCount}
                                  </td>
                                  <td>
                                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                      <div style={{ width:80, height:6, background:'var(--border)',
                                        borderRadius:4, overflow:'hidden' }}>
                                        <div style={{ height:'100%', width:`${pct}%`,
                                          background:'var(--primary)', borderRadius:4,
                                          transition:'width .6s' }}/>
                                      </div>
                                      <span style={{ fontSize:12, fontWeight:600, color:'var(--text3)' }}>
                                        {pct}%
                                      </span>
                                    </div>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

function AvatarCell({ name, color = '#7C3AED' }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
      <div style={{ width:32, height:32, borderRadius:'50%', background:color,
        color:'#fff', fontWeight:700, fontSize:13,
        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        {name?.charAt(0)?.toUpperCase()}
      </div>
      <span style={{ fontWeight:500 }}>{name}</span>
    </div>
  )
}

function FormInput({ label, ...props }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
      <label style={{ fontSize:13, fontWeight:600, color:'var(--text2)' }}>{label}</label>
      <input style={{ width:'100%', padding:'10px 14px',
        border:'1.5px solid var(--border)', borderRadius:10,
        fontSize:14, outline:'none', fontFamily:'inherit',
        background:'var(--surface)' }} {...props}/>
    </div>
  )
}

const S = {
  layout: { display:'flex', minHeight:'100vh', background:'var(--bg)' },
  sidebar: { width:240, background:'var(--surface)', borderRight:'1px solid var(--border)',
    display:'flex', flexDirection:'column', justifyContent:'space-between',
    padding:'24px 16px', flexShrink:0, position:'sticky', top:0, height:'100vh', overflow:'auto' },
  sideTop: { display:'flex', flexDirection:'column', gap:24 },
  sideLogo: { display:'flex', alignItems:'center', gap:10, padding:'0 8px' },
  logoMark: { width:34, height:34, borderRadius:10,
    background:'linear-gradient(135deg,#3B5BDB,#7C3AED)',
    color:'#fff', fontFamily:'var(--font-h)', fontWeight:800, fontSize:13,
    display:'flex', alignItems:'center', justifyContent:'center' },
  logoName: { fontFamily:'var(--font-h)', fontWeight:800, fontSize:15, color:'var(--text1)' },
  logoSub: { fontSize:11, color:'var(--text4)' },
  adminBadge: { display:'flex', alignItems:'center', gap:10,
    background:'#F5F3FF', border:'1px solid rgba(124,58,237,.15)',
    borderRadius:10, padding:'10px 12px' },
  adminAvatar: { width:36, height:36, borderRadius:'50%', background:'#7C3AED',
    color:'#fff', fontWeight:700, fontSize:15,
    display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  adminName: { fontSize:13, fontWeight:600, color:'var(--text1)' },
  adminRole: { fontSize:11, color:'#7C3AED' },
  nav: { display:'flex', flexDirection:'column', gap:2 },
  navItem: { display:'flex', alignItems:'center', gap:10, padding:'10px 12px',
    borderRadius:10, border:'none', background:'transparent',
    color:'var(--text3)', fontSize:14, fontWeight:500, cursor:'pointer',
    textAlign:'left', transition:'all .15s' },
  navActive: { background:'#F5F3FF', color:'#7C3AED', fontWeight:600 },
  logoutBtn: { padding:'10px 12px', borderRadius:10,
    border:'1px solid var(--border)', background:'transparent',
    color:'var(--text3)', fontSize:13, fontWeight:500,
    cursor:'pointer', textAlign:'left' },
  main: { flex:1, padding:'32px', overflow:'auto' },
  topBar: { display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:28 },
  pageTitle: { fontFamily:'var(--font-h)', fontSize:28, fontWeight:800,
    color:'var(--text1)', marginBottom:4 },
  pageDesc: { fontSize:14, color:'var(--text3)' },
  statsGrid: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:20 },
  chartCard: { background:'var(--surface)', border:'1px solid var(--border)',
    borderRadius:'var(--r-lg)', padding:'20px 24px', boxShadow:'var(--shadow-sm)' },
  cardTitle: { fontSize:15, fontWeight:700, color:'var(--text1)',
    marginBottom:16, fontFamily:'var(--font-h)' },
  formCard: { background:'var(--surface)', border:'1px solid var(--border)',
    borderRadius:'var(--r-lg)', padding:'24px', marginBottom:16, boxShadow:'var(--shadow-sm)' },
  formNote: { fontSize:13, color:'#0369A1', background:'#EFF6FF',
    border:'1px solid #BFDBFE', borderRadius:8,
    padding:'8px 12px', marginBottom:16 },
  formGrid: { display:'grid', gridTemplateColumns:'1fr 1fr auto', gap:16, alignItems:'end' },
  tableCard: { background:'var(--surface)', border:'1px solid var(--border)',
    borderRadius:'var(--r-lg)', overflow:'hidden', boxShadow:'var(--shadow-sm)' },
  tableTitle: { fontSize:14, fontWeight:700, color:'var(--text1)',
    padding:'16px 20px', borderBottom:'1px solid var(--border)', fontFamily:'var(--font-h)' },
  leaderCard: { background:'linear-gradient(135deg,#FEF3C7,#FDE68A)',
    border:'1px solid #FCD34D', borderRadius:'var(--r-lg)',
    padding:'24px 28px', display:'flex', alignItems:'center', gap:20 },
}