import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { getResults } from '../../api/api.js'
import Button from '../../components/shared/Button.jsx'
import Badge from '../../components/shared/Badge.jsx'
import Spinner from '../../components/shared/Spinner.jsx'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import toast from 'react-hot-toast'

const COLORS = ['#3B5BDB','#7C3AED','#F59E0B','#10B981','#EF4444']

export default function ResultsPage() {
  const { voterUser, voterLogout } = useAuth()
  const navigate = useNavigate()
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [updated, setUpdated] = useState('')

  const load = () => {
    setLoading(true)
    getResults()
      .then(d => { setResults(d); setUpdated(new Date().toLocaleTimeString()) })
      .catch(() => toast.error('Failed to load results'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!voterUser) { navigate('/voter/login'); return }
    load()
  }, [])

  const total = results.reduce((s,c) => s+c.voteCount, 0)

  return (
    <div style={S.page} className="fade-in">
      <nav style={S.nav}>
        <div style={S.navLogo}>
          <div style={S.navMark}>VS</div>
          <span style={S.navName}>VoteShield</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          {!voterUser?.hasVoted && <Button variant="primary" size="sm" onClick={()=>navigate('/voter/vote')}>🗳️ Cast Vote</Button>}
          <Button variant="ghost" size="sm" onClick={load}>🔄 Refresh</Button>
          <button onClick={()=>{voterLogout();navigate('/')}} style={S.logoutBtn}>↩ Logout</button>
        </div>
      </nav>

      <div style={S.body}>
        <div style={S.header}>
          <div style={S.livePill}><span style={S.liveDot}/> Live Results</div>
          <h1 style={S.title}>Election Results</h1>
          <p style={S.sub}>{total} total votes • Last updated {updated||'—'}</p>
          {voterUser?.hasVoted && <div style={S.votedBanner}>✓ You have cast your vote</div>}
        </div>

        {loading ? <Spinner/> : results.length === 0 ? (
          <div style={{textAlign:'center',padding:'60px',color:'var(--text3)'}}>
            <div style={{fontSize:48,marginBottom:12}}>🏆</div>
            <p style={{fontSize:16,fontWeight:600}}>No votes yet</p>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:20}}>
            {results[0]?.voteCount > 0 && (
              <div style={S.leaderCard} className="fade-up">
                <div style={{fontSize:48,marginRight:4}}>👑</div>
                <div style={{flex:1}}>
                  <p style={{fontSize:11,fontWeight:700,color:'#92400E',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:6}}>🏆 Current Leader</p>
                  <p style={{fontFamily:'var(--font-h)',fontSize:26,fontWeight:800,color:'var(--text1)',marginBottom:4}}>{results[0].name}</p>
                  <p style={{fontSize:14,color:'#78716C'}}>{results[0].partyName}</p>
                </div>
                <div style={{textAlign:'right'}}>
                  <p style={{fontFamily:'var(--font-h)',fontSize:48,fontWeight:800,color:'#B45309',lineHeight:1}}>{results[0].voteCount}</p>
                  <p style={{fontSize:13,color:'#92400E',fontWeight:500}}>votes</p>
                </div>
              </div>
            )}

            <div style={S.card}>
              <h3 style={S.cardTitle}>Vote Distribution</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={results} margin={{top:8,right:16,left:0,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false}/>
                  <XAxis dataKey="name" tick={{fontSize:12,fill:'var(--text3)',fontFamily:'var(--font)'}} axisLine={false} tickLine={false}/>
                  <YAxis allowDecimals={false} tick={{fontSize:12,fill:'var(--text3)'}} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={{background:'#0F172A',color:'#fff',border:'none',borderRadius:10,fontSize:13,fontFamily:'var(--font)'}} formatter={v=>[`${v} votes`,'']}/>
                  <Bar dataKey="voteCount" radius={[8,8,0,0]} maxBarSize={64}>
                    {results.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{...S.card, padding:0, overflow:'hidden'}}>
              <div style={{padding:'16px 24px',borderBottom:'1px solid var(--border)'}}>
                <h3 style={{...S.cardTitle, marginBottom:0}}>Standings</h3>
              </div>
              <table className="vs-table">
                <thead><tr><th>Rank</th><th>Candidate</th><th>Party</th><th>Votes</th><th>Share</th></tr></thead>
                <tbody>
                  {results.map((c,i) => {
                    const pct = total>0 ? ((c.voteCount/total)*100).toFixed(1) : '0.0'
                    return (
                      <tr key={c.id}>
                        <td style={{fontFamily:'var(--font-h)',fontSize:18,fontWeight:800,color:i===0&&c.voteCount>0?'#B45309':'var(--text4)'}}>
                          {i===0&&c.voteCount>0 ? '🥇' : i===1 ? '🥈' : i===2 ? '🥉' : i+1}
                        </td>
                        <td>
                          <div style={{display:'flex',alignItems:'center',gap:10}}>
                            <div style={{width:34,height:34,borderRadius:9,background:COLORS[i%COLORS.length],color:'#fff',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                              {c.partySymbol||c.name.charAt(0)}
                            </div>
                            <span style={{fontWeight:600,color:'var(--text1)'}}>{c.name}</span>
                          </div>
                        </td>
                        <td><Badge variant="blue">{c.partyName}</Badge></td>
                        <td style={{fontFamily:'var(--font-h)',fontSize:18,fontWeight:800,color:'var(--text1)'}}>{c.voteCount}</td>
                        <td>
                          <div style={{display:'flex',alignItems:'center',gap:10}}>
                            <div style={{width:90,height:6,background:'var(--border)',borderRadius:4,overflow:'hidden'}}>
                              <div style={{height:'100%',width:`${pct}%`,background:COLORS[i%COLORS.length],borderRadius:4,transition:'width .7s'}}/>
                            </div>
                            <span style={{fontSize:13,fontWeight:600,color:'var(--text3)',minWidth:40}}>{pct}%</span>
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
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </div>
  )
}

const S = {
  page: { minHeight:'100vh', background:'var(--bg)', display:'flex', flexDirection:'column' },
  nav: { background:'var(--surface)', borderBottom:'1px solid var(--border)', padding:'0 32px', height:64, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100 },
  navLogo: { display:'flex', alignItems:'center', gap:10 },
  navMark: { width:32, height:32, borderRadius:9, background:'linear-gradient(135deg,#3B5BDB,#7C3AED)', color:'#fff', fontFamily:'var(--font-h)', fontWeight:800, fontSize:12, display:'flex', alignItems:'center', justifyContent:'center' },
  navName: { fontFamily:'var(--font-h)', fontWeight:800, fontSize:17, color:'var(--text1)' },
  logoutBtn: { padding:'7px 14px', borderRadius:9, border:'1px solid var(--border)', background:'transparent', color:'var(--text3)', fontSize:13, cursor:'pointer' },
  body: { maxWidth:900, margin:'0 auto', padding:'40px 24px', width:'100%' },
  header: { textAlign:'center', marginBottom:32 },
  livePill: { display:'inline-flex', alignItems:'center', gap:7, background:'#F0FDF4', border:'1px solid #BBF7D0', color:'#166534', fontSize:12, fontWeight:600, padding:'5px 14px', borderRadius:99, marginBottom:12 },
  liveDot: { width:7, height:7, borderRadius:'50%', background:'#22C55E', animation:'pulse 1.5s infinite', display:'inline-block' },
  title: { fontFamily:'var(--font-h)', fontSize:36, fontWeight:800, color:'var(--text1)', marginBottom:8 },
  sub: { fontSize:14, color:'var(--text3)', marginBottom:16 },
  votedBanner: { display:'inline-flex', alignItems:'center', gap:6, background:'#F0FDF4', border:'1px solid #BBF7D0', color:'#166534', fontSize:13, fontWeight:600, padding:'6px 16px', borderRadius:99 },
  leaderCard: { background:'linear-gradient(135deg,#FEF3C7,#FDE68A)', border:'1px solid #FCD34D', borderRadius:'var(--r-xl)', padding:'28px 32px', display:'flex', alignItems:'center', gap:24, boxShadow:'0 4px 24px rgba(245,158,11,.2)' },
  card: { background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:'24px', boxShadow:'var(--shadow-sm)' },
  cardTitle: { fontFamily:'var(--font-h)', fontSize:17, fontWeight:700, color:'var(--text1)', marginBottom:18 },
}
