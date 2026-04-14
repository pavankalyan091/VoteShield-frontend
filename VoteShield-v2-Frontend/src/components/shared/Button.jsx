export default function Button({ children, variant='primary', size='md', loading, icon, fullWidth, ...props }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 8, fontFamily: 'var(--font)', fontWeight: 600, cursor: 'pointer',
    border: 'none', borderRadius: 'var(--r-md)', transition: 'all .15s',
    width: fullWidth ? '100%' : undefined,
    opacity: props.disabled ? .6 : 1,
  }
  const sizes = {
    sm: { padding: '7px 14px', fontSize: 13 },
    md: { padding: '11px 20px', fontSize: 14 },
    lg: { padding: '13px 28px', fontSize: 15 },
  }
  const variants = {
    primary: { background: 'var(--primary)', color: '#fff', boxShadow: '0 1px 2px rgba(59,91,219,.3)' },
    admin:   { background: 'var(--admin)',   color: '#fff', boxShadow: '0 1px 2px rgba(124,58,237,.3)' },
    ghost:   { background: 'transparent', color: 'var(--text2)', border: '1.5px solid var(--border)' },
    danger:  { background: '#FEF2F2', color: 'var(--red)', border: '1px solid #FECACA' },
    success: { background: '#F0FDF4', color: 'var(--green)', border: '1px solid #BBF7D0' },
  }

  return (
    <button style={{ ...base, ...sizes[size], ...variants[variant] }} {...props}>
      {loading ? <span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,.4)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin .7s linear infinite', display:'inline-block' }}/> : icon}
      {children}
    </button>
  )
}
