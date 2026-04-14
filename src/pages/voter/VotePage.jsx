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
  const [sel, setSel] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!voterUser) { navigate('/voter/login'); return }
    if (voterUser.hasVoted) { navigate('/voter/results'); return }
    getVoteCandidates()
      .then(setCandidates)
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false))
  }, [])

  const confirm = async () => {
    setSubmitting(true)
    try {
      await castVote(voterUser.id, sel.id)
      markVoted(); setDone(true); setShowModal(false)
      toast.success(`Vote cast for ${sel.name}!`)
      setTimeout(() => navigate('/voter/results'), 2800)
    } catch(err) { toast.error(err.message); setSel(null); setShowModal(false) }
    finally { setSubmitting(false) }
  }

  if (done) return (
    <div style={S.successPage} className="fade-up">
      <div style={S.successCard}>
        <div style={S.check}>✓</div>
        <h2 style={S.successTitle}>Vote Cast!</h2>
        <p style={{fontSize:15,color:'var(--text3)',marginBottom:6}}>You voted for</p>
        <p style={{fontFamily:'var(--font-h)',fontSize:22,fontWeight:800,
          color:'var(--primary)',marginBottom:4}}>{sel?.name}</p>
        <p style={{fontSize:14,color:'var(--text4)',marginBottom:24}}>{sel?.partyName}</p>
        <div style={{height:4,background:'var(--border)',borderRadius:4,overflow:'hidden'}}>
          <div style={{height:'100%',background:'var(--primary)',
            animation:'fillBar 2.8s linear forwards'}}/>
        </div>
        <p style={{fontSize:12,color:'var(--text4)',marginTop:12}}>Redirecting to results…</p>
      </div>
    </div>
  )

  return (
    <div style={S.page}>
      <nav style={S.nav}>
        <div style={S.navL}>
          <div style={S.mark}>VS</div>
          <span style={S.brand}>VoteShield</span>
        </div>
        <div style={S.navR}>
          <div style={S.voterChip}>
            <div style={S.avatar}>{voterUser?.fullName?.charAt(0)}</div>
            <div>
              <p style={{fontSize:13,fontWeight:600,color:'var(--text1)',lineHeight:1.2}}>
                {voterUser?.fullName}
              </p>
              <p style={{fontSize:11,color:'var(--text3)',fontFamily:'monospace'}}>
                {voterUser?.voterId || ''}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/voter/results')}>
            📊 Results
          </Button>
          <button onClick={() => { voterLogout(); navigate('/') }} style={S.logoutBtn}>
            ↩ Logout
          </button>
        </div>
      </nav>

      <div style={S.body}>
        <div style={S.header}>
          <div style={S.liveBadge}><span style={S.liveDot}/> Election is Live</div>
          <h1 style={S.title}>Cast Your Vote</h1>
          <p style={S.sub}>Select one candidate. Your vote is final and cryptographically secured.</p>
        </div>

        {loading ? <Spinner/> : candidates.length === 0 ? (
          <div style={{textAlign:'center',padding:'60px',color:'var(--text3)'}}>
            <div style={{fontSize:48,marginBottom:12}}>🏛️</div>
            <p style={{fontSize:16,fontWeight:600}}>No candidates yet</p>
          </div>
        ) : (
          <div style={S.grid}>
            {candidates.map((c, i) => (
              <div key={c.id} onClick={() => setSel(c)} className="fade-up"
                style={{ ...S.card, ...(sel?.id === c.id ? S.cardSel : {}) }}>
                <div style={{...S.candIcon, background:COLORS[i%COLORS.length]}}>
                  {c.partySymbol || c.name.charAt(0)}
                </div>
                <div style={{flex:1}}>
                  <h3 style={S.candName}>{c.name}</h3>
                  <p style={S.candParty}>{c.partyName}</p>
                </div>
                <div style={{...S.radio, ...(sel?.id===c.id ? S.radioSel : {})}}>
                  {sel?.id===c.id && <div style={S.radioDot}/>}
                </div>
              </div>
            ))}
          </div>
        )}

        {sel && !loading && (
          <div style={S.bar} className="fade-up">
            <div style={{display:'flex',alignItems:'center',gap:14}}>
              <span style={{fontSize:22}}>{sel.partySymbol}</span>
              <div>
                <p style={{fontSize:12,color:'var(--text4)',marginBottom:2}}>Selected candidate</p>
                <p style={{fontSize:15,fontWeight:700,color:'var(--text1)'}}>
                  {sel.name} · {sel.partyName}
                </p>
              </div>
            </div>
            <Button size="lg" onClick={() => setShowModal(true)}>🗳️ Cast My Vote</Button>
          </div>
        )}
      </div>

      {showModal && sel && (
        <div style={S.overlay} onClick={() => !submitting && setShowModal(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()} className="fade-up">
            <div style={{fontSize:40,marginBottom:14}}>⚠️</div>
            <h2 style={S.modalTitle}>Confirm your vote</h2>
            <p style={{fontSize:14,color:'var(--text3)',marginBottom:16}}>You are voting for:</p>
            <div style={S.modalCand}>
              <div style={{fontSize:32,marginBottom:8}}>{sel.partySymbol}</div>
              <p style={{fontFamily:'var(--font-h)',fontSize:20,fontWeight:800,
                color:'var(--text1)',marginBottom:4}}>{sel.name}</p>
              <p style={{fontSize:13,color:'var(--text3)'}}>{sel.partyName}</p>
            </div>
            <div style={S.warn}>
              🔐 <strong>This vote is cryptographically secured.</strong>
              {' '}Cannot be undone. One vote per voter.
            </div>
            <div style={{display:'flex',gap:10}}>
              <Button variant="ghost" full onClick={() => setShowModal(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button full onClick={confirm} loading={submitting}>
                {!submitting && '✓ Confirm Vote'}
              </Button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes fillBar{from{width:0}to{width:100%}}
      `}</style>
    </div>
  )
}

const S = {
  page:{minHeight:'100vh',background:'var(--bg)'},
  nav:{background:'var(--surface)',borderBottom:'1px solid var(--border)',padding:'0 32px',
    height:64,display:'flex',alignItems:'center',justifyContent:'space-between',
    position:'sticky',top:0,zIndex:100,boxShadow:'var(--shadow-sm)'},
  navL:{display:'flex',alignItems:'center',gap:10},
  mark:{width:32,height:32,borderRadius:9,background:'linear-gradient(135deg,#3B5BDB,#7C3AED)',
    color:'#fff',fontFamily:'var(--font-h)',fontWeight:800,fontSize:12,
    display:'flex',alignItems:'center',justifyContent:'center'},
  brand:{fontFamily:'var(--font-h)',fontWeight:800,fontSize:17,color:'var(--text1)'},
  navR:{display:'flex',alignItems:'center',gap:12},
  voterChip:{display:'flex',alignItems:'center',gap:10,background:'var(--surface2)',
    border:'1px solid var(--border)',borderRadius:10,padding:'7px 12px'},
  avatar:{width:30,height:30,borderRadius:'50%',background:'var(--primary)',
    color:'#fff',fontWeight:700,fontSize:13,display:'flex',alignItems:'center',justifyContent:'center'},
  logoutBtn:{padding:'7px 14px',borderRadius:'var(--r-md)',border:'1px solid var(--border)',
    background:'transparent',color:'var(--text3)',fontSize:13,cursor:'pointer'},
  body:{maxWidth:680,margin:'0 auto',padding:'40px 24px'},
  header:{textAlign:'center',marginBottom:32},
  liveBadge:{display:'inline-flex',alignItems:'center',gap:7,background:'#F0FDF4',
    border:'1px solid #BBF7D0',color:'#166534',fontSize:12,fontWeight:600,
    padding:'5px 14px',borderRadius:99,marginBottom:14},
  liveDot:{width:7,height:7,borderRadius:'50%',background:'#22C55E',
    animation:'pulse 1.5s infinite',display:'inline-block'},
  title:{fontFamily:'var(--font-h)',fontSize:36,fontWeight:800,color:'var(--text1)',marginBottom:8},
  sub:{fontSize:15,color:'var(--text3)'},
  grid:{display:'flex',flexDirection:'column',gap:12,marginBottom:100},
  card:{background:'var(--surface)',border:'2px solid var(--border)',borderRadius:'var(--r-lg)',
    padding:'20px 24px',display:'flex',alignItems:'center',gap:16,cursor:'pointer',
    transition:'all .15s',boxShadow:'var(--shadow-sm)'},
  cardSel:{border:'2px solid var(--primary)',boxShadow:'0 0 0 4px rgba(59,91,219,.1)',
    background:'#FAFBFF'},
  candIcon:{width:52,height:52,borderRadius:'var(--r-md)',color:'#fff',fontSize:24,
    display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0},
  candName:{fontFamily:'var(--font-h)',fontSize:17,fontWeight:700,color:'var(--text1)',marginBottom:4},
  candParty:{fontSize:13,color:'var(--text3)'},
  radio:{width:22,height:22,borderRadius:'50%',border:'2px solid var(--border2)',
    display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all .15s'},
  radioSel:{border:'2px solid var(--primary)',background:'var(--primary-l)'},
  radioDot:{width:10,height:10,borderRadius:'50%',background:'var(--primary)'},
  bar:{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--r-lg)',
    padding:'16px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',
    boxShadow:'var(--shadow-lg)',position:'fixed',bottom:24,left:'50%',
    transform:'translateX(-50%)',width:'calc(100% - 48px)',maxWidth:680},
  overlay:{position:'fixed',inset:0,background:'rgba(13,27,62,.55)',backdropFilter:'blur(6px)',
    display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:20},
  modal:{background:'var(--surface)',borderRadius:'var(--r-xxl)',padding:'36px 32px',
    maxWidth:420,width:'100%',boxShadow:'var(--shadow-xl)',textAlign:'center'},
  modalTitle:{fontFamily:'var(--font-h)',fontSize:24,fontWeight:800,color:'var(--text1)',marginBottom:6},
  modalCand:{background:'var(--surface2)',border:'1px solid var(--border)',
    borderRadius:'var(--r-xl)',padding:'20px',marginBottom:16},
  warn:{background:'#F0FDF4',border:'1px solid #BBF7D0',borderRadius:10,
    padding:'10px 14px',fontSize:13,color:'#166534',marginBottom:20,textAlign:'left'},
  successPage:{minHeight:'100vh',background:'var(--bg)',display:'flex',
    alignItems:'center',justifyContent:'center',padding:24},
  successCard:{background:'var(--surface)',borderRadius:'var(--r-xxl)',padding:'48px 40px',
    textAlign:'center',maxWidth:440,boxShadow:'var(--shadow-xl)',border:'1px solid var(--border)'},
  check:{width:72,height:72,borderRadius:'50%',
    background:'linear-gradient(135deg,#22C55E,#16A34A)',color:'#fff',fontSize:32,fontWeight:700,
    display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px'},
  successTitle:{fontFamily:'var(--font-h)',fontSize:30,fontWeight:800,color:'var(--text1)',marginBottom:12},
}
