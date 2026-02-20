// app/not-found.tsx
export default function NotFound() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 50%, #40916C 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      textAlign: 'center',
      padding: '2rem',
      fontFamily: 'system-ui'
    }}>
      <div style={{ maxWidth: '500px' }}>
        <div style={{ fontSize: '6rem', marginBottom: '2rem' }}>📡</div>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: 800 }}>
          Sin conexión a Internet
        </h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.95, lineHeight: 1.8, marginBottom: '2.5rem' }}>
          No hay conexión en este momento, pero no te preocupes. 
          Los datos que registres se guardarán localmente.
        </p>
        <a 
          href="/"
          style={{
            display: 'inline-block',
            background: 'white',
            color: '#1B4332',
            border: 'none',
            padding: '1.25rem 3rem',
            borderRadius: '3rem',
            fontWeight: 'bold',
            fontSize: '1.2rem',
            cursor: 'pointer',
            textDecoration: 'none'
          }}
        >
          🔄 Volver al inicio
        </a>
      </div>
    </div>
  );
}
