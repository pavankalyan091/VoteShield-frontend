import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext.jsx'
import LandingPage      from './pages/LandingPage.jsx'
import AdminLoginPage   from './pages/admin/AdminLoginPage.jsx'
import AdminDashboard   from './pages/admin/AdminDashboard.jsx'
import VoterLoginPage   from './pages/voter/VoterLoginPage.jsx'
import VotePage         from './pages/voter/VotePage.jsx'
import ResultsPage      from './pages/voter/ResultsPage.jsx'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { fontFamily: 'var(--font)', fontSize: 14, borderRadius: 10, boxShadow: 'var(--shadow-lg)' },
            success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
          }}
        />
        <Routes>
          <Route path="/"                  element={<LandingPage/>} />
          <Route path="/admin/login"        element={<AdminLoginPage/>} />
          <Route path="/admin/dashboard"    element={<AdminDashboard/>} />
          <Route path="/voter/login"        element={<VoterLoginPage/>} />
          <Route path="/voter/vote"         element={<VotePage/>} />
          <Route path="/voter/results"      element={<ResultsPage/>} />
          <Route path="*"                   element={<Navigate to="/" replace/>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
