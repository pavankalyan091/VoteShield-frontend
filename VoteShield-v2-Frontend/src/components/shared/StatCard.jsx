export default function StatCard({ label, value, icon, color = '#3B5BDB', bg = '#EEF2FF' }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--r-lg)', padding: '20px 24px',
      display: 'flex', alignItems: 'center', gap: 16,
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ width: 52, height: 52, borderRadius: 'var(--r-md)', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--text1)', lineHeight: 1.1, fontFamily: 'var(--font-h)' }}>{value}</p>
        <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 3 }}>{label}</p>
      </div>
    </div>
  )
}
