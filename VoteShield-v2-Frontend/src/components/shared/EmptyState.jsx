export default function EmptyState({ icon, title, message }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text3)' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>{icon}</div>
      <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>{title}</p>
      <p style={{ fontSize: 14 }}>{message}</p>
    </div>
  )
}
