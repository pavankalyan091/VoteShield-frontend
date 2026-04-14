import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { getVoteCandidates, castVote } from '../../api/api.js'
import Button from '../../components/shared/Button.jsx'
import Spinner from '../../components/shared/Spinner.jsx'
import toast from 'react-hot-toast'

const COLORS = ['#3B5BDB','#7C3AED','#F59E0B','#10B981','#EF4444']

export default function VotePage() {
  const { voterUser, voterLogout, markVoted } = useAuth()
  const navigate = useNavigate()
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!voterUser) { navigate('/voter/login'); return }
    if (voterUser.hasVoted) { navigate('/voter/results'); return }
    getVoteCandidates()
      .then(setCandidates)
      .catch(() => toast.error('Could not load candidates. Is backend running?'))
      .finally(() => setLoading(false))
  }, [])

  const confirm = async () => {
    setSubmitting(true)
    try {
      await castVote(voterUser.id, selected.id)
      markVoted()
      setDone(true)
      setShowConfirm(false)
      toast.success(`Vote cast for ${selected.name}!`)
      setTimeout(() => navigate('/voter/results'), 3000)
    } catch(err) { toast.error(err.message); setSelected(null); setShowConfirm(false) }
    finally { setSubmitting(false) }
  }

  if (done) return (
    <div style={S.successPage} className="fade-up">
      <div style={S.successCard}>
        <div style={S.checkAnim}>✓</div>
        <h2 style={S.successTitle}>Vote Recorded!</h2>
        <p style={S.successName}>You voted for <strong>{selected?.name}</strong></p>
        <p style={S.successParty}>{selected?.partyName}</p>
        <div style={S.successDivider}/>
        <p style={S.successNote}>Your vote has been securely recorded. Redirecting to results…</p>
        <div style={S.progressBar}><div style={S.progressFill}/></div>
      </div>
    </div>
  )

  return (
    <div style={S.page} className="fade-in">
      <nav style={S.nav}>
        <div style={S.navLogo}>
          <div style={S.navMark}>VS</div>
          <span style={S.navName}>VoteShield</span>
        </div>
        <div style={S.navRight}>
          <div style={S.navUser}>
            <div style={S.userAvatar}>{voterUser?.fullName?.charAt(0)}</div>
            <div>
              <p style={{fontSize:13,fontWeight:600,color:'var(--text1)'}}>{voterUser?.fullName}</p>
              <p style={{fontSize:11,color:'var(--text3)'}}>Registered Voter</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={()=>navigate('/voter/results')}>📊 Results</Button>
          <button onClick={()=>{voterLogout();navigate('/')}} style={S.logoutBtn}>↩ Logout</button>
        </div>
      </nav>

      <div style={S.body}>
        <div style={S.header}>
          <div style={S.livePill}>
            <span style={S.liveDot}/> Election is Live
          </div>
          <h1 style={S.title}>Cast Your Vote</h1>
          <p style={S.sub}>Select one candidate. Your vote is final and cannot be changed.</p>
        </div>

        {loading ? <Spinner/> : candidates.length === 0 ? (
          <div style={{textAlign:'center',padding:'60px',color:'var(--text3)'}}>
            <div style={{fontSize:48,marginBottom:12}}>🏛️</div>
            <p style={{fontSize:16,fontWeight:600}}>No candidates available</p>
            <p style={{fontSize:14,marginTop:8}}>Contact your administrator</p>
          </div>
        ) : (
          <div style={S.grid}>
            {candidates.map((c, i) => (
              <div key={c.id}
                onClick={() => setSelected(c)}
                style={{...S.card, ...(selected?.id===c.id ? S.cardSelected : {})}}>
                <div style={S.cardLeft}>
                  <div style={{...S.candAvatar, background:COLORS[i%COLORS.length]}}>
                    {c.partySymbol || c.name.charAt(0)}
                  </div>
                  <div>
                    <h3 style={S.candName}>{c.name}</h3>
                    <p style={S.candParty}>{c.partyName}</p>
                  </div>
                </div>
                <div style={{...S.radio, ...(selected?.id===c.id ? S.radioSelected : {})}}>
                  {selected?.id===c.id && <div style={S.radioDot}/>}
                </div>
              </div>
            ))}
          </div>
        )}

        {selected && !loading && (
          <div style={S.voteBar}>
            <div style={S.voteBarLeft}>
              <span style={{fontSize:24}}>{selected.partySymbol || '🏛️'}</span>
              <div>
                <p style={{fontSize:13,color:'var(--text3)',marginBottom:2}}>Selected Candidate</p>
                <p style={{fontSize:15,fontWeight:700,color:'var(--text1)'}}>{selected.name} — {selected.partyName}</p>
              </div>
            </div>
            <Button variant="primary" size="lg" onClick={() => setShowConfirm(true)}>
              🗳️ Cast My Vote
            </Button>
          </div>
        )}
      </div>

      {showConfirm && selected && (
        <div style={M.overlay} onClick={() => !submitting && setShowConfirm(false)}>
          <div style={M.modal} onClick={e=>e.stopPropagation()} className="fade-up">
            <div style={{fontSize:40,marginBottom:14}}>⚠️</div>
            <h2 style={M.title}>Confirm Your Vote</h2>
            <p style={M.sub}>You are about to vote for:</p>
            <div style={M.candBox}>
              <div style={{fontSize:36,marginBottom:8}}>{selected.partySymbol || '🏛️'}</div>
              <p style={{fontFamily:'var(--font-h)',fontSize:20,fontWeight:800,color:'var(--text1)',marginBottom:4}}>{selected.name}</p>
              <p style={{fontSize:14,color:'var(--text3)'}}>{selected.partyName}</p>
            </div>
            <div style={M.warning}>
              ⚠️ <strong>This action is permanent.</strong> Each voter can only vote once.
            </div>
            <div style={M.actions}>
              <Button variant="ghost" fullWidth onClick={() => setShowConfirm(false)} disabled={submitting}>Cancel</Button>
              <Button variant="primary" fullWidth onClick={confirm} loading={submitting}>
                {!submitting && '✓ Confirm Vote'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}} @keyframes fillBar{from{width:0}to{width:100%}}`}</style>
    </div>
  )
}

const S = {
  page:{minHeight:'100vh',background:'var(--bg)',display:'flex',flexDirection:'column'},
  nav:{background:'var(--surface)',borderBottom:'1px solid var(--border)',padding:'0 32px',height:64,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100},
  navLogo:{display:'flex',alignItems:'center',gap:10},
  navMark:{width:32,height:32,borderRadius:9,background:'linear-gradient(135deg,#3B5BDB,#7C3AED)',color:'#fff',fontFamily:'var(--font-h)',fontWeight:800,fontSize:12,display:'flex',alignItems:'center',justifyContent:'center'},
  navName:{fontFamily:'var(--font-h)',fontWeight:800,fontSize:17,color:'var(--text1)'},
  navRight:{display:'flex',alignItems:'center',gap:12},
  navUser:{display:'flex',alignItems:'center',gap:10,padding:'6px 12px',background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:10},
  userAvatar:{width:30,height:30,borderRadius:'50%',background:'var(--primary)',color:'#fff',fontWeight:700,fontSize:13,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0},
  logoutBtn:{padding:'7px 14px',borderRadius:9,border:'1px solid var(--border)',background:'transparent',color:'var(--text3)',fontSize:13,cursor:'pointer'},
  body:{maxWidth:680,margin:'0 auto',padding:'40px 24px',width:'100%',flex:1},
  header:{textAlign:'center',marginBottom:32},
  livePill:{display:'inline-flex',alignItems:'center',gap:7,background:'#F0FDF4',border:'1px solid #BBF7D0',color:'#166534',fontSize:12,fontWeight:600,padding:'5px 14px',borderRadius:99,marginBottom:14},
  liveDot:{width:7,height:7,borderRadius:'50%',background:'#22C55E',animation:'pulse 1.5s infinite',display:'inline-block'},
  title:{fontFamily:'var(--font-h)',fontSize:36,fontWeight:800,color:'var(--text1)',marginBottom:8},
  sub:{fontSize:15,color:'var(--text3)'},
  grid:{display:'flex',flexDirection:'column',gap:12,marginBottom:100},
  card:{background:'var(--surface)',border:'2px solid var(--border)',borderRadius:'var(--r-lg)',padding:'20px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer',transition:'all .15s',boxShadow:'var(--shadow-sm)'},
  cardSelected:{border:'2px solid var(--primary)',boxShadow:'0 0 0 4px rgba(59,91,219,.1)',background:'#FAFBFF'},
  cardLeft:{display:'flex',alignItems:'center',gap:16},
  candAvatar:{width:52,height:52,borderRadius:'var(--r-md)',color:'#fff',fontSize:24,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0},
  candName:{fontFamily:'var(--font-h)',fontSize:17,fontWeight:700,color:'var(--text1)',marginBottom:4},
  candParty:{fontSize:13,color:'var(--text3)'},
  radio:{width:22,height:22,borderRadius:'50%',border:'2px solid var(--border2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all .15s'},
  radioSelected:{border:'2px solid var(--primary)',background:'var(--primary-l)'},
  radioDot:{width:10,height:10,borderRadius:'50%',background:'var(--primary)'},
  voteBar:{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--r-lg)',padding:'16px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',boxShadow:'var(--shadow-lg)',position:'fixed',bottom:24,left:'50%',transform:'translateX(-50%)',width:'calc(100% - 48px)',maxWidth:680},
  voteBarLeft:{display:'flex',alignItems:'center',gap:14},
  successPage:{minHeight:'100vh',background:'linear-gradient(160deg,#EEF2FF,#F5F3FF)',display:'flex',alignItems:'center',justifyContent:'center',padding:24},
  successCard:{background:'var(--surface)',borderRadius:24,padding:'48px 40px',textAlign:'center',maxWidth:440,boxShadow:'var(--shadow-xl)',border:'1px solid var(--border)'},
  checkAnim:{width:72,height:72,borderRadius:'50%',background:'linear-gradient(135deg,#22C55E,#16A34A)',color:'#fff',fontSize:32,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px'},
  successTitle:{fontFamily:'var(--font-h)',fontSize:32,fontWeight:800,color:'var(--text1)',marginBottom:12},
  successName:{fontSize:16,color:'var(--text2)',marginBottom:4},
  successParty:{fontSize:14,color:'var(--text3)',marginBottom:20},
  successDivider:{height:1,background:'var(--border)',margin:'20px 0'},
  successNote:{fontSize:14,color:'var(--text3)',marginBottom:16},
  progressBar:{height:4,background:'var(--border)',borderRadius:4,overflow:'hidden'},
  progressFill:{height:'100%',background:'var(--primary)',borderRadius:4,animation:'fillBar 3s linear forwards'},
}
const M = {
  overlay:{position:'fixed',inset:0,background:'rgba(15,23,42,.6)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:20},
  modal:{background:'var(--surface)',borderRadius:20,padding:'36px 32px',maxWidth:420,width:'100%',boxShadow:'var(--shadow-xl)',textAlign:'center'},
  title:{fontFamily:'var(--font-h)',fontSize:24,fontWeight:800,color:'var(--text1)',marginBottom:6},
  sub:{fontSize:14,color:'var(--text3)',marginBottom:16},
  candBox:{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:'var(--r-md)',padding:'20px',marginBottom:16},
  warning:{background:'#FFFBEB',border:'1px solid #FDE68A',borderRadius:10,padding:'10px 14px',fontSize:13,color:'#92400E',marginBottom:20,textAlign:'left'},
  actions:{display:'flex',gap:10},
}
