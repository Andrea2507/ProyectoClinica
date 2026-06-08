import { useEffect, useState } from 'react';
import DataTable from '../components/DataTable.jsx';
import JsonBlock from '../components/JsonBlock.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatusMessage from '../components/StatusMessage.jsx';
import { fetchJson } from '../services/api.js';

const reports = [
  { key: 'topDiagnosticos', title: 'Top diagnosticos', path: '/api/reportes-mongo/top-diagnosticos' },
  { key: 'medicamentos', title: 'Medicamentos por especialidad', path: '/api/reportes-mongo/medicamentos-especialidad' },
  { key: 'signos', title: 'Signos vitales por grupo', path: '/api/reportes-mongo/signos-vitales' },
  { key: 'tiempoConsultas', title: 'Tiempo promedio entre consultas', path: '/api/reportes-mongo/tiempo-promedio-consultas' },
  { key: 'resumen', title: 'Resumen clinico con $facet', path: '/api/reportes-mongo/resumen-clinico' }
];

function ResultView({ value }) {
  if (!value) return <p className="empty-panel">Esperando resultados del reporte.</p>;
  if (Array.isArray(value) && !value.length) return <p className="empty-panel">La consulta no devolvio registros.</p>;
  return Array.isArray(value) ? <DataTable data={value} /> : <JsonBlock value={value} />;
}

export default function ReportesMongo() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  async function loadAll() {
    setLoading(true);
    setErrors({});

    const entries = await Promise.allSettled(
      reports.map(async (report) => [report.key, await fetchJson(report.path)])
    );

    const nextResults = {};
    const nextErrors = {};

    entries.forEach((entry, index) => {
      const report = reports[index];
      if (entry.status === 'fulfilled') {
        nextResults[entry.value[0]] = entry.value[1];
      } else {
        nextErrors[report.key] = entry.reason.message;
      }
    });

    setResults(nextResults);
    setErrors(nextErrors);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  return (
    <>
      <PageHeader title="Reportes MongoDB" description="Agregaciones clinicas desde historiales en MongoDB.">
        <button onClick={loadAll}>Actualizar</button>
      </PageHeader>

      <section className="report-grid">
        {reports.map((report) => (
          <article className="report-panel" key={report.key}>
            <div className="panel-title-row">
              <div>
                <h2>{report.title}</h2>
                <p className="panel-help">Resultado calculado con agregaciones sobre historiales clinicos.</p>
              </div>
            </div>
            <StatusMessage loading={loading} error={errors[report.key]} compact />
            <ResultView value={results[report.key]} />
          </article>
        ))}
      </section>
    </>
  );
}
