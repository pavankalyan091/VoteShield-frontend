export default function Spinner({ size = 28 }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
      <div style={{ width: size, height: size, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin .7s linear infinite' }}/>
    </div>
  )
}
