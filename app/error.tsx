'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Si el error es de red/offline, mostrar página especial
  const isNetworkError = error.message.includes('fetch') || 
                         error.message.includes('network') ||
                         error.message.includes('Failed to fetch');

  if (isNetworkError || !navigator.onLine) {
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
          <button 
            onClick={() => reset()}
            style={{
              background: 'white',
              color: '#1B4332',
              border: 'none',
              padding: '1.25rem 3rem',
              borderRadius: '3rem',
              fontWeight: 'bold',
              fontSize: '1.2rem',
              cursor: 'pointer'
            }}
          >
            🔄 Reintentar conexión
          </button>
        </div>
      </div>
    );
  }

  // Para otros errores, mostrar error genérico
  return (
    <div style={{
      background: '#1B4332',
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
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️ Error</h1>
        <p style={{ marginBottom: '2rem' }}>{error.message}</p>
        <button 
          onClick={() => reset()}
          style={{
            background: 'white',
            color: '#1B4332',
            border: 'none',
            padding: '1rem 2rem',
            borderRadius: '2rem',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
