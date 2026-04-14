export default function Card({ children, style, padding = '24px' }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-lg)',
      boxShadow: 'var(--shadow-sm)',
      padding,
      ...style,
    }}>
      {children}
    </div>
  )
}
