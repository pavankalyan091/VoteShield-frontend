import axios from 'axios'

const client = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

client.interceptors.response.use(
  r => r,
  err => {
    const msg = err.response?.data || err.message || 'Something went wrong'
    return Promise.reject(new Error(String(msg)))
  }
)

// ── Auth ──────────────────────────────────────────────────────────────
export const adminLogin  = d  => client.post('/auth/admin/login', d).then(r => r.data)
export const voterLogin  = d  => client.post('/auth/voter/login', d).then(r => r.data)

// ── Admin — Voters ────────────────────────────────────────────────────
// v3: createVoter only needs { fullName, email } — no password
export const createVoter  = d  => client.post('/admin/voters', d).then(r => r.data)
export const updateVoter  = (id, d) => client.put(`/admin/voters/${id}`, d).then(r => r.data)
export const getAllVoters  = ()  => client.get('/admin/voters').then(r => r.data)
export const deleteVoter  = id  => client.delete(`/admin/voters/${id}`).then(r => r.data)

// ── Admin — Candidates ────────────────────────────────────────────────
export const createCandidate = d  => client.post('/admin/candidates', d).then(r => r.data)
export const updateCandidate = (id, d) => client.put(`/admin/candidates/${id}`, d).then(r => r.data)
export const getAllCandidates = ()  => client.get('/admin/candidates').then(r => r.data)
export const deleteCandidate = id  => client.delete(`/admin/candidates/${id}`).then(r => r.data)

// ── Admin — Stats & Integrity ─────────────────────────────────────────
export const getStats           = () => client.get('/admin/stats').then(r => r.data)
export const verifyIntegrity    = () => client.get('/admin/verify-integrity').then(r => r.data)

// ── Voter — Voting ────────────────────────────────────────────────────
export const getVoteCandidates = () => client.get('/vote/candidates').then(r => r.data)
export const castVote = (voterId, candidateId) =>
  client.post('/vote/cast', { voterId, candidateId }).then(r => r.data)
export const getResults = () => client.get('/vote/results').then(r => r.data)
