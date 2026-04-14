const VARIANTS = {
  blue:   { bg: '#EEF2FF', color: '#3730A3' },
  green:  { bg: '#F0FDF4', color: '#166534' },
  red:    { bg: '#FEF2F2', color: '#991B1B' },
  yellow: { bg: '#FFFBEB', color: '#92400E' },
  purple: { bg: '#F5F3FF', color: '#5B21B6' },
  gray:   { bg: '#F1F5F9', color: '#475569' },
}
export default function Badge({ children, variant = 'blue' }) {
  const v = VARIANTS[variant] || VARIANTS.blue
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 99,
      fontSize: 12, fontWeight: 600,
      background: v.bg, color: v.color,
    }}>
      {children}
    </span>
  )
}
