import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import StatusMessage from '../components/StatusMessage.jsx';
import { fetchJson } from '../services/api.js';

const metrics = [
  { label: 'Pacientes', path: '/api/pacientes' },
  { label: 'Medicos', path: '/api/medicos' },
  { label: 'Citas', path: '/api/citas' },
  { label: 'Pagos', path: '/api/pagos' },
  { label: 'Historiales', path: '/api/historiales' }
];

const modules = [
  'Pacientes',
  'Medicos',
  'Citas',
  'Pagos',
  'Historiales clinicos',
  'Reportes PostgreSQL',
  'Reportes MongoDB'
];

export default function Dashboard() {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadSummary() {
      setLoading(true);
      setError('');

      const results = await Promise.allSettled(
        metrics.map(async (metric) => {
          const data = await fetchJson(metric.path);
          return { ...metric, total: Array.isArray(data) ? data.length : 0 };
        })
      );

      const summaryItems = results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        }

        return { ...metrics[index], total: 'N/D' };
      });

      setSummary(summaryItems);

      if (results.some((result) => result.status === 'rejected')) {
        setError('Algunos indicadores no se pudieron cargar. Revisa que el backend este activo.');
      }

      setLoading(false);
    }

    loadSummary();
  }, []);

  return (
    <>
      <PageHeader
        title="Dashboard principal"
        description="Resumen visual de la clinica privada y sus modulos operativos."
      />

      <StatusMessage loading={loading} error={error} />

      <section className="metric-grid">
        {summary.map((item) => (
          <article className="metric-card" key={item.label}>
            <span>{item.label}</span>
            <strong>{item.total}</strong>
          </article>
        ))}
      </section>

      <section className="content-section">
        <h2>Modulos disponibles</h2>
        <div className="module-grid">
          {modules.map((module) => (
            <div className="module-card" key={module}>
              <strong>{module}</strong>
              <span>Consulta y gestion conectada al backend existente.</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
