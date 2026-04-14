import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import * as api from '../../api/api.js'
import StatCard from '../../components/shared/StatCard.jsx'
import Button from '../../components/shared/Button.jsx'
import Badge from '../../components/shared/Badge.jsx'
import Spinner from '../../components/shared/Spinner.jsx'
import EmptyState from '../../components/shared/EmptyState.jsx'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import toast from 'react-hot-toast'

const TABS = ['Overview', 'Voters', 'Candidates', 'Results', 'Integrity']
const BAR_COLORS = ['#3B5BDB','#7C3AED','#F59E0B','#10B981','#EF4444']

export default function AdminDashboard() {
  const { adminUser, adminLogout } = useAuth()
  const navigate = useNavigate()

  const [tab, setTab]             = useState('Overview')
  const [stats, setStats]         = useState(null)
  const [voters, setVoters]       = useState([])
  const [candidates, setCandidates] = useState([])
  const [results, setResults]     = useState([])
  const [loading, setLoading]     = useState(true)

  // Add voter form (v3: no password — system generates it)
  const [voterForm, setVoterForm]       = useState({ fullName: '', email: '' })
  const [addingVoter, setAddingVoter]   = useState(false)
  const [showVoterForm, setShowVoterForm] = useState(false)

  // Edit voter
  const [editVoter, setEditVoter]   = useState(null)
  const [editVoterForm, setEditVoterForm] = useState({ fullName: '', email: '' })
  const [savingVoter, setSavingVoter] = useState(false)

  // Add candidate form
  const [candForm, setCandForm]         = useState({ name: '', partyName: '', partySymbol: '' })
  const [addingCand, setAddingCand]     = useState(false)
  const [showCandForm, setShowCandForm] = useState(false)

  // Edit candidate
  const [editCand, setEditCand]   = useState(null)
  const [editCandForm, setEditCandForm] = useState({ name: '', partyName: '', partySymbol: '' })
  const [savingCand, setSavingCand] = useState(false)

  // Integrity
  const [integrity, setIntegrity]     = useState(null)
  const [checkingIntegrity, setCheckingIntegrity] = useState(false)

  useEffect(() => {
    if (!adminUser) { navigate('/admin/login'); return }
    loadAll()
  }, [])

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

  // ── Add Voter ──────────────────────────────────────────────────────
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

  // ── Edit Voter ─────────────────────────────────────────────────────
  const openEditVoter = v => {
    setEditVoter(v)
    setEditVoterForm({ fullName: v.fullName, email: v.email })
  }
  const handleEditVoter = async e => {
    e.preventDefault()
    setSavingVoter(true)
    try {
      await api.updateVoter(editVoter.id, editVoterForm)
      toast.success('Voter updated!')
      setEditVoter(null)
      loadAll()
    } catch (err) { toast.error(err.message) }
    finally { setSavingVoter(false) }
  }

  // ── Delete Voter ───────────────────────────────────────────────────
  const handleDeleteVoter = async voter => {
    if (voter.hasVoted) { toast.error('Cannot delete a voter who has already voted.'); return }
    if (!confirm(`Delete voter ${voter.fullName}?`)) return
    try { await api.deleteVoter(voter.id); toast.success('Voter removed'); loadAll() }
    catch (err) { toast.error(err.message) }
  }

  // ── Add Candidate ──────────────────────────────────────────────────
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

  // ── Edit Candidate ─────────────────────────────────────────────────
  const openEditCand = c => {
    setEditCand(c)
    setEditCandForm({ name: c.name, partyName: c.partyName, partySymbol: c.partySymbol })
  }
  const handleEditCand = async e => {
    e.preventDefault()
    setSavingCand(true)
    try {
      await api.updateCandidate(editCand.id, editCandForm)
      toast.success('Candidate updated!')
      setEditCand(null)
      loadAll()
    } catch (err) { toast.error(err.message) }
    finally { setSavingCand(false) }
  }

  // ── Delete Candidate ───────────────────────────────────────────────
  const handleDeleteCandidate = async id => {
    if (!confirm('Delete this candidate?')) return
    try { await api.deleteCandidate(id); toast.success('Candidate removed'); loadAll() }
    catch (err) { toast.error(err.message) }
  }

  // ── Integrity check ────────────────────────────────────────────────
  const handleVerify = async () => {
    setCheckingIntegrity(true)
    try {
      const res = await api.verifyIntegrity()
      setIntegrity(res)
    } catch (err) { toast.error(err.message) }
    finally { setCheckingIntegrity(false) }
  }

  const handleLogout = () => { adminLogout(); navigate('/') }

  return (
    <div style={S.layout}>
      {/* Sidebar */}
      <aside style={S.sidebar}>
        <div style={S.sideTop}>
          <div style={S.logo}>
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
                {{ Overview:'📊', Voters:'👥', Candidates:'🏛️', Results:'🏆', Integrity:'🔐' }[t]} {t}
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
                 Candidates:'Manage election candidates', Results:'Live election results',
                 Integrity:'Verify vote tamper-proof hashes' }[tab]}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
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
                      <BarChart data={results} margin={{ top:8,right:16,left:0,bottom:0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false}/>
                        <XAxis dataKey="name" tick={{ fontSize:12, fill:'#64748B' }} axisLine={false} tickLine={false}/>
                        <YAxis allowDecimals={false} tick={{ fontSize:12, fill:'#64748B' }} axisLine={false} tickLine={false}/>
                        <Tooltip contentStyle={{ background:'#0F172A', color:'#fff', border:'none', borderRadius:10, fontSize:13 }}
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
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                {/* Add Form */}
                {showVoterForm && (
                  <div style={S.formCard}>
                    <h3 style={S.cardTitle}>Register New Voter</h3>
                    <p style={S.formNote}>
                      🔒 Password is <strong>auto-generated</strong> and sent directly to the voter's email.
                      Admin never sees it.
                    </p>
                    <form onSubmit={handleAddVoter} style={S.formRow}>
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
                        <Button type="button" variant="ghost" onClick={() => setShowVoterForm(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Edit Modal */}
                {editVoter && (
                  <div style={S.modalOverlay} onClick={() => setEditVoter(null)}>
                    <div style={S.modalBox} onClick={e => e.stopPropagation()}>
                      <h3 style={S.cardTitle}>Edit Voter</h3>
                      <p style={S.formNote}>Password cannot be changed — voter owns it.</p>
                      <form onSubmit={handleEditVoter} style={{ display:'flex', flexDirection:'column', gap:14 }}>
                        <FormInput label="Full Name"
                          value={editVoterForm.fullName}
                          onChange={e => setEditVoterForm(p => ({ ...p, fullName: e.target.value }))}/>
                        <FormInput label="Email" type="email"
                          value={editVoterForm.email}
                          onChange={e => setEditVoterForm(p => ({ ...p, email: e.target.value }))}/>
                        <div style={{ display:'flex', gap:8, marginTop:8 }}>
                          <Button type="submit" variant="admin" loading={savingVoter}>Save Changes</Button>
                          <Button type="button" variant="ghost" onClick={() => setEditVoter(null)}>Cancel</Button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* Table */}
                <div style={S.tableCard}>
                  <p style={S.tableTitle}>All Voters ({voters.length})</p>
                  {voters.length === 0
                    ? <EmptyState icon="👥" title="No voters registered" message="Add voters using the button above"/>
                    : (
                      <table className="vs-table">
                        <thead><tr>
                          <th>Voter</th><th>Email</th><th>Voter ID</th><th>Status</th><th>Actions</th>
                        </tr></thead>
                        <tbody>
                          {voters.map(v => (
                            <tr key={v.id}>
                              <td><AvatarCell name={v.fullName}/></td>
                              <td style={{ color:'var(--text3)' }}>{v.email}</td>
                              <td>
                                <span style={{ fontFamily:'monospace', fontSize:13, color:'var(--text-secondary)',
                                  background:'var(--color-background-secondary)', padding:'2px 8px', borderRadius:6 }}>
                                  {v.voterId || '—'}
                                </span>
                              </td>
                              <td>
                                {v.hasVoted
                                  ? <Badge variant="green">✓ Voted</Badge>
                                  : <Badge variant="yellow">Pending</Badge>}
                              </td>
                              <td>
                                <div style={{ display:'flex', gap:6 }}>
                                  <Button variant="ghost" size="sm" onClick={() => openEditVoter(v)}>✏️ Edit</Button>
                                  <Button variant="danger" size="sm"
                                    onClick={() => handleDeleteVoter(v)}
                                    disabled={v.hasVoted}
                                    title={v.hasVoted ? 'Cannot delete a voter who has voted' : ''}>
                                    Remove
                                  </Button>
                                </div>
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
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                {/* Add Form */}
                {showCandForm && (
                  <div style={S.formCard}>
                    <h3 style={S.cardTitle}>Add New Candidate</h3>
                    <form onSubmit={handleAddCandidate} style={S.formRow}>
                      <FormInput label="Full Name" placeholder="Candidate name"
                        value={candForm.name}
                        onChange={e => setCandForm(p => ({ ...p, name: e.target.value }))}/>
                      <FormInput label="Party Name" placeholder="Party name"
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

                {/* Edit Modal */}
                {editCand && (
                  <div style={S.modalOverlay} onClick={() => setEditCand(null)}>
                    <div style={S.modalBox} onClick={e => e.stopPropagation()}>
                      <h3 style={S.cardTitle}>Edit Candidate</h3>
                      <p style={S.formNote}>Vote count cannot be edited — system controlled.</p>
                      <form onSubmit={handleEditCand} style={{ display:'flex', flexDirection:'column', gap:14 }}>
                        <FormInput label="Full Name"
                          value={editCandForm.name}
                          onChange={e => setEditCandForm(p => ({ ...p, name: e.target.value }))}/>
                        <FormInput label="Party Name"
                          value={editCandForm.partyName}
                          onChange={e => setEditCandForm(p => ({ ...p, partyName: e.target.value }))}/>
                        <FormInput label="Party Symbol (emoji)"
                          value={editCandForm.partySymbol}
                          onChange={e => setEditCandForm(p => ({ ...p, partySymbol: e.target.value }))}/>
                        <div style={{ display:'flex', gap:8, marginTop:8 }}>
                          <Button type="submit" variant="admin" loading={savingCand}>Save Changes</Button>
                          <Button type="button" variant="ghost" onClick={() => setEditCand(null)}>Cancel</Button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* Table */}
                <div style={S.tableCard}>
                  <p style={S.tableTitle}>All Candidates ({candidates.length})</p>
                  {candidates.length === 0
                    ? <EmptyState icon="🏛️" title="No candidates yet" message="Add candidates using the button above"/>
                    : (
                      <table className="vs-table">
                        <thead><tr>
                          <th>Candidate</th><th>Party</th><th>Symbol</th><th>Votes</th><th>Actions</th>
                        </tr></thead>
                        <tbody>
                          {candidates.map(c => (
                            <tr key={c.id}>
                              <td><AvatarCell name={c.name} color="#3B5BDB"/></td>
                              <td style={{ color:'var(--text3)' }}>{c.partyName}</td>
                              <td style={{ fontSize:22 }}>{c.partySymbol}</td>
                              <td><Badge variant="blue">{c.voteCount} votes</Badge></td>
                              <td>
                                <div style={{ display:'flex', gap:6 }}>
                                  <Button variant="ghost" size="sm" onClick={() => openEditCand(c)}>✏️ Edit</Button>
                                  <Button variant="danger" size="sm" onClick={() => handleDeleteCandidate(c.id)}>Remove</Button>
                                </div>
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
                            <p style={S.leaderLabel}>Current Leader</p>
                            <p style={S.leaderName}>{results[0].name}</p>
                            <p style={S.leaderParty}>{results[0].partyName}</p>
                          </div>
                          <div style={{ textAlign:'right' }}>
                            <p style={S.leaderVotes}>{results[0].voteCount}</p>
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
                              const total = results.reduce((s,x) => s + x.voteCount, 0)
                              const pct = total > 0 ? ((c.voteCount / total) * 100).toFixed(1) : '0.0'
                              return (
                                <tr key={c.id}>
                                  <td style={{ fontWeight:700, fontSize:18, color: i===0&&c.voteCount>0 ? '#B45309' : 'var(--text3)' }}>
                                    {i===0&&c.voteCount>0 ? '🥇' : i===1 ? '🥈' : i===2 ? '🥉' : i+1}
                                  </td>
                                  <td><AvatarCell name={c.name} color="#3B5BDB"/></td>
                                  <td><Badge variant="blue">{c.partyName}</Badge></td>
                                  <td style={{ fontWeight:700, fontSize:16, color:'var(--color-text-primary)' }}>{c.voteCount}</td>
                                  <td>
                                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                      <div style={{ width:80, height:6, background:'var(--color-border-tertiary)', borderRadius:4, overflow:'hidden' }}>
                                        <div style={{ height:'100%', width:`${pct}%`, background:'var(--p)', borderRadius:4, transition:'width .6s' }}/>
                                      </div>
                                      <span style={{ fontSize:12, fontWeight:600, color:'var(--text3)' }}>{pct}%</span>
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

            {/* ── INTEGRITY ── */}
            {tab === 'Integrity' && (
              <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                {/* Explain */}
                <div style={S.infoCard}>
                  <h3 style={S.cardTitle}>🔐 SHA-256 Vote Integrity Verification</h3>
                  <p style={S.infoText}>
                    Every vote is protected by a <strong>SHA-256 cryptographic hash</strong> generated at the time of voting.
                    The hash is computed from: <code>voterID + candidateID + timestamp + secretSalt</code>.
                    If anyone tampers with the database, the hash will not match and fraud is detected instantly.
                  </p>
                  <Button variant="admin" onClick={handleVerify} loading={checkingIntegrity}>
                    {!checkingIntegrity && '🔍'} Verify All Votes
                  </Button>
                </div>

                {/* Result */}
                {integrity && (
                  <div style={{
                    ...S.integrityResult,
                    borderColor: integrity.electionIntact ? '#22C55E' : '#EF4444',
                    background: integrity.electionIntact ? '#F0FDF4' : '#FEF2F2',
                  }}>
                    <div style={{ fontSize:48, marginBottom:12 }}>
                      {integrity.electionIntact ? '✅' : '🚨'}
                    </div>
                    <h2 style={{ ...S.integrityTitle, color: integrity.electionIntact ? '#166534' : '#991B1B' }}>
                      {integrity.electionIntact ? 'Election Integrity Confirmed' : 'Tampering Detected!'}
                    </h2>
                    <p style={{ fontSize:15, color: integrity.electionIntact ? '#166534' : '#991B1B', marginBottom:20 }}>
                      {integrity.message}
                    </p>
                    <div style={S.integrityStats}>
                      <div style={S.iStat}>
                        <p style={S.iStatNum}>{integrity.totalVotes}</p>
                        <p style={S.iStatLabel}>Total Votes</p>
                      </div>
                      <div style={S.iStat}>
                        <p style={{ ...S.iStatNum, color:'#166534' }}>{integrity.validVotes}</p>
                        <p style={S.iStatLabel}>Valid</p>
                      </div>
                      <div style={S.iStat}>
                        <p style={{ ...S.iStatNum, color: integrity.tamperedVotes > 0 ? '#991B1B' : '#94A3B8' }}>
                          {integrity.tamperedVotes}
                        </p>
                        <p style={S.iStatLabel}>Tampered</p>
                      </div>
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
      <div style={{
        width:32, height:32, borderRadius:'50%', background:color,
        color:'#fff', fontWeight:700, fontSize:13,
        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0
      }}>
        {name?.charAt(0)?.toUpperCase()}
      </div>
      <span style={{ fontWeight:500 }}>{name}</span>
    </div>
  )
}

function FormInput({ label, ...props }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
      <label style={{ fontSize:13, fontWeight:600, color:'var(--color-text-secondary)' }}>{label}</label>
      <input style={{ padding:'10px 14px', border:'1.5px solid var(--color-border-tertiary)',
        borderRadius:10, fontSize:14, outline:'none', fontFamily:'inherit',
        background:'var(--color-background-primary)', paddingLeft:16 }} {...props}/>
    </div>
  )
}

const S = {
  layout: { display:'flex', minHeight:'100vh', background:'var(--color-background-tertiary)' },
  sidebar: { width:240, background:'var(--color-background-primary)', borderRight:'1px solid var(--color-border-tertiary)', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'24px 16px', flexShrink:0, position:'sticky', top:0, height:'100vh', overflow:'auto' },
  sideTop: { display:'flex', flexDirection:'column', gap:24 },
  logo: { display:'flex', alignItems:'center', gap:10, padding:'0 8px' },
  logoMark: { width:34, height:34, borderRadius:10, background:'linear-gradient(135deg,#3B5BDB,#7C3AED)', color:'#fff', fontFamily:'var(--font-h,sans-serif)', fontWeight:800, fontSize:13, display:'flex', alignItems:'center', justifyContent:'center' },
  logoName: { fontWeight:800, fontSize:15, color:'var(--color-text-primary)' },
  logoSub: { fontSize:11, color:'var(--color-text-tertiary)' },
  adminBadge: { display:'flex', alignItems:'center', gap:10, background:'#F5F3FF', border:'1px solid rgba(124,58,237,.15)', borderRadius:10, padding:'10px 12px' },
  adminAvatar: { width:36, height:36, borderRadius:'50%', background:'#7C3AED', color:'#fff', fontWeight:700, fontSize:15, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  adminName: { fontSize:13, fontWeight:600, color:'var(--color-text-primary)' },
  adminRole: { fontSize:11, color:'#7C3AED' },
  nav: { display:'flex', flexDirection:'column', gap:2 },
  navItem: { display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, border:'none', background:'transparent', color:'var(--color-text-secondary)', fontSize:14, fontWeight:500, cursor:'pointer', textAlign:'left', transition:'all .15s' },
  navActive: { background:'#F5F3FF', color:'#7C3AED', fontWeight:600 },
  logoutBtn: { padding:'10px 12px', borderRadius:10, border:'1px solid var(--color-border-tertiary)', background:'transparent', color:'var(--color-text-secondary)', fontSize:13, fontWeight:500, cursor:'pointer', textAlign:'left' },
  main: { flex:1, padding:'32px', overflow:'auto' },
  topBar: { display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:28 },
  pageTitle: { fontSize:28, fontWeight:800, color:'var(--color-text-primary)', marginBottom:4 },
  pageDesc: { fontSize:14, color:'var(--color-text-secondary)' },
  statsGrid: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:20 },
  chartCard: { background:'var(--color-background-primary)', border:'1px solid var(--color-border-tertiary)', borderRadius:16, padding:'20px 24px' },
  cardTitle: { fontSize:15, fontWeight:700, color:'var(--color-text-primary)', marginBottom:10 },
  formCard: { background:'var(--color-background-primary)', border:'1px solid var(--color-border-tertiary)', borderRadius:16, padding:'24px', boxShadow:'0 1px 4px rgba(0,0,0,.05)' },
  formNote: { fontSize:13, color:'var(--color-text-secondary)', background:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:8, padding:'8px 12px', marginBottom:16 },
  formRow: { display:'grid', gridTemplateColumns:'repeat(3,1fr) auto', gap:16, alignItems:'end' },
  tableCard: { background:'var(--color-background-primary)', border:'1px solid var(--color-border-tertiary)', borderRadius:16, overflow:'hidden' },
  tableTitle: { fontSize:14, fontWeight:700, color:'var(--color-text-primary)', padding:'16px 20px', borderBottom:'1px solid var(--color-border-tertiary)' },
  leaderCard: { background:'linear-gradient(135deg,#FEF3C7,#FDE68A)', border:'1px solid #FCD34D', borderRadius:16, padding:'24px 28px', display:'flex', alignItems:'center', gap:20 },
  leaderLabel: { fontSize:11, fontWeight:700, color:'#92400E', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:4 },
  leaderName: { fontSize:20, fontWeight:700, color:'var(--color-text-primary)', marginBottom:2 },
  leaderParty: { fontSize:14, color:'#78716C' },
  leaderVotes: { fontSize:40, fontWeight:800, color:'#B45309', lineHeight:1 },
  modalOverlay: { position:'fixed', inset:0, background:'rgba(0,0,0,.5)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:24 },
  modalBox: { background:'var(--color-background-primary)', borderRadius:20, padding:'32px', maxWidth:440, width:'100%', boxShadow:'0 24px 48px rgba(0,0,0,.15)' },
  infoCard: { background:'var(--color-background-primary)', border:'1px solid var(--color-border-tertiary)', borderRadius:16, padding:'24px' },
  infoText: { fontSize:14, color:'var(--color-text-secondary)', lineHeight:1.7, marginBottom:20 },
  integrityResult: { border:'2px solid', borderRadius:20, padding:'36px', textAlign:'center' },
  integrityTitle: { fontSize:24, fontWeight:800, marginBottom:8 },
  integrityStats: { display:'flex', gap:32, justifyContent:'center' },
  iStat: { textAlign:'center' },
  iStatNum: { fontSize:36, fontWeight:800, lineHeight:1.1 },
  iStatLabel: { fontSize:13, color:'var(--color-text-secondary)', marginTop:4 },
}
