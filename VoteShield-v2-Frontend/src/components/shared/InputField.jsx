export default function InputField({ label, icon, error, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>{label}</label>}
      <div style={{ position: 'relative' }}>
        {icon && <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, pointerEvents: 'none' }}>{icon}</span>}
        <input {...props} style={{ paddingLeft: icon ? 44 : 16, ...(props.style||{}) }} />
      </div>
      {error && <p style={{ fontSize: 12, color: 'var(--red)', marginTop: 2 }}>{error}</p>}
    </div>
  )
}
