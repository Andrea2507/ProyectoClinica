export default function StatusMessage({ loading, error, empty, success, compact = false }) {
  const className = compact ? 'status compact' : 'status';

  if (loading) {
    return <div className={`${className} loading`}>Cargando datos...</div>;
  }

  if (error) {
    return <div className={`${className} error`}>{error}</div>;
  }

  if (success) {
    return <div className={`${className} success`}>{success}</div>;
  }

  if (empty) {
    return <div className={className}>No hay datos para mostrar.</div>;
  }

  return null;
}
