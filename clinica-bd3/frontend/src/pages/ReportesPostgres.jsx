import { useState } from 'react';
import DataTable from '../components/DataTable.jsx';
import FormField from '../components/FormField.jsx';
import JsonBlock from '../components/JsonBlock.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatusMessage from '../components/StatusMessage.jsx';
import { fetchJson } from '../services/api.js';

const reports = [
  { key: 'facturas', title: 'Facturas pendientes', path: '/api/reportes/facturas-pendientes' },
  { key: 'facturacion', title: 'Facturacion mensual', path: '/api/reportes/facturacion-mensual' },
  { key: 'ranking', title: 'Ranking de medicos', path: '/api/reportes/ranking-medicos' }
];

function ReportResult({ value }) {
  if (!value) return <p className="empty-panel">Presiona consultar para cargar este reporte.</p>;
  if (Array.isArray(value) && !value.length) return <p className="empty-panel">La consulta no devolvio registros.</p>;
  return Array.isArray(value) ? <DataTable data={value} /> : <JsonBlock value={value} />;
}

export default function ReportesPostgres() {
  const [fecha, setFecha] = useState('2026-06-01');
  const [pacienteId, setPacienteId] = useState('1');
  const [medicoId, setMedicoId] = useState('1');
  const [fechaDisponibilidad, setFechaDisponibilidad] = useState('2026-06-01');
  const [results, setResults] = useState({});
  const [loadingKey, setLoadingKey] = useState('');
  const [errors, setErrors] = useState({});

  async function loadReport(key, path) {
    setLoadingKey(key);
    setErrors((current) => ({ ...current, [key]: '' }));

    try {
      const data = await fetchJson(path);
      setResults((current) => ({ ...current, [key]: data }));
    } catch (err) {
      setErrors((current) => ({ ...current, [key]: err.message }));
    } finally {
      setLoadingKey('');
    }
  }

  return (
    <>
      <PageHeader title="Reportes PostgreSQL" description="Consultas operativas generadas desde PostgreSQL." />

      <section className="report-grid">
        <article className="report-panel">
          <div className="panel-title-row">
            <div>
              <h2>Agenda diaria</h2>
              <p className="panel-help">Consulta las citas programadas para una fecha especifica.</p>
            </div>
          </div>
          <div className="inline-form">
            <FormField label="Fecha">
              <input type="date" value={fecha} onChange={(event) => setFecha(event.target.value)} />
            </FormField>
            <button onClick={() => loadReport('agenda', `/api/reportes/agenda-diaria?fecha=${fecha}`)}>
              Consultar
            </button>
          </div>
          <StatusMessage loading={loadingKey === 'agenda'} error={errors.agenda} compact />
          <ReportResult value={results.agenda} />
        </article>

        {reports.map((report) => (
          <article className="report-panel" key={report.key}>
            <div className="panel-title-row">
              <div>
                <h2>{report.title}</h2>
                <p className="panel-help">Reporte generado directamente desde PostgreSQL.</p>
              </div>
              <button onClick={() => loadReport(report.key, report.path)}>Consultar</button>
            </div>
            <StatusMessage loading={loadingKey === report.key} error={errors[report.key]} compact />
            <ReportResult value={results[report.key]} />
          </article>
        ))}

        <article className="report-panel">
          <div className="panel-title-row">
            <div>
              <h2>Saldo por paciente</h2>
              <p className="panel-help">Ingresa el paciente para revisar su saldo pendiente.</p>
            </div>
          </div>
          <div className="inline-form">
            <FormField label="Paciente ID">
              <input type="number" value={pacienteId} onChange={(event) => setPacienteId(event.target.value)} />
            </FormField>
            <button onClick={() => loadReport('saldo', `/api/reportes/saldo-paciente/${pacienteId}`)}>
              Consultar
            </button>
          </div>
          <StatusMessage loading={loadingKey === 'saldo'} error={errors.saldo} compact />
          <ReportResult value={results.saldo} />
        </article>

        <article className="report-panel">
          <div className="panel-title-row">
            <div>
              <h2>Disponibilidad de medico</h2>
              <p className="panel-help">Consulta espacios disponibles por medico y fecha.</p>
            </div>
          </div>
          <div className="inline-form">
            <FormField label="Medico ID">
              <input type="number" value={medicoId} onChange={(event) => setMedicoId(event.target.value)} />
            </FormField>
            <FormField label="Fecha">
              <input type="date" value={fechaDisponibilidad} onChange={(event) => setFechaDisponibilidad(event.target.value)} />
            </FormField>
            <button onClick={() => loadReport('disponibilidad', `/api/reportes/disponibilidad-medico?medicoId=${medicoId}&fecha=${fechaDisponibilidad}`)}>
              Consultar
            </button>
          </div>
          <StatusMessage loading={loadingKey === 'disponibilidad'} error={errors.disponibilidad} compact />
          <ReportResult value={results.disponibilidad} />
        </article>
      </section>
    </>
  );
}
