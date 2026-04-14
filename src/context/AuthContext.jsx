import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('vs_admin') || 'null') } catch { return null }
  })
  const [voterUser, setVoterUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('vs_voter') || 'null') } catch { return null }
  })

  const adminLogin  = useCallback(u => { localStorage.setItem('vs_admin', JSON.stringify(u)); setAdminUser(u) }, [])
  const adminLogout = useCallback(() => { localStorage.removeItem('vs_admin'); setAdminUser(null) }, [])
  const voterLogin  = useCallback(u => { localStorage.setItem('vs_voter', JSON.stringify(u)); setVoterUser(u) }, [])
  const voterLogout = useCallback(() => { localStorage.removeItem('vs_voter'); setVoterUser(null) }, [])
  const markVoted   = useCallback(() => setVoterUser(p => {
    const u = { ...p, hasVoted: true }
    localStorage.setItem('vs_voter', JSON.stringify(u))
    return u
  }), [])

  return (
    <AuthContext.Provider value={{
      adminUser, adminLogin, adminLogout,
      voterUser, voterLogin, voterLogout, markVoted
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
