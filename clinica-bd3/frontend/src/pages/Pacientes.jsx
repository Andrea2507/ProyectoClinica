import { useState } from 'react';
import DataTable from '../components/DataTable.jsx';
import FormField from '../components/FormField.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatusMessage from '../components/StatusMessage.jsx';
import { useApiData } from '../hooks/useApiData.js';
import { postJson } from '../services/api.js';

const initialForm = {
  nombres: '',
  apellidos: '',
  fecha_nacimiento: '',
  telefono: '',
  email: '',
  direccion: ''
};

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'nombres', label: 'Nombres' },
  { key: 'apellidos', label: 'Apellidos' },
  { key: 'fecha_nacimiento', label: 'Fecha nacimiento' },
  { key: 'telefono', label: 'Telefono' },
  { key: 'email', label: 'Email' },
  { key: 'direccion', label: 'Direccion' }
];

export default function Pacientes() {
  const { data, loading, error, load } = useApiData('/api/pacientes');
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ error: '', success: '' });

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setStatus({ error: '', success: '' });

    try {
      await postJson('/api/pacientes', form);
      setForm(initialForm);
      setStatus({ error: '', success: 'Paciente registrado correctamente.' });
      await load();
    } catch (err) {
      setStatus({ error: err.message, success: '' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader title="Pacientes" description="Registro y listado general de pacientes." />

      <section className="form-panel">
        <div className="panel-title-row">
          <div>
            <h2>Registrar paciente</h2>
            <p className="panel-help">Guarda datos personales y de contacto para agendar citas.</p>
          </div>
        </div>
        <StatusMessage error={status.error} success={status.success} compact />
        <form onSubmit={handleSubmit} className="form-grid">
          <FormField label="Nombres">
            <input value={form.nombres} onChange={(event) => updateField('nombres', event.target.value)} required />
          </FormField>
          <FormField label="Apellidos">
            <input value={form.apellidos} onChange={(event) => updateField('apellidos', event.target.value)} required />
          </FormField>
          <FormField label="Fecha nacimiento">
            <input type="date" value={form.fecha_nacimiento} onChange={(event) => updateField('fecha_nacimiento', event.target.value)} required />
          </FormField>
          <FormField label="Telefono">
            <input value={form.telefono} onChange={(event) => updateField('telefono', event.target.value)} />
          </FormField>
          <FormField label="Email">
            <input type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} />
          </FormField>
          <FormField label="Direccion">
            <input value={form.direccion} onChange={(event) => updateField('direccion', event.target.value)} />
          </FormField>
          <button disabled={saving}>{saving ? 'Guardando...' : 'Registrar paciente'}</button>
        </form>
      </section>

      <section className="report-panel">
        <div className="panel-title-row">
          <div>
            <h2>Pacientes registrados</h2>
            <p className="panel-help">Consulta los datos principales para identificar rapidamente a cada paciente.</p>
          </div>
          <span className="counter-pill">{data.length}</span>
        </div>
        <StatusMessage loading={loading} error={error} empty={!loading && !data.length} compact />
        <DataTable data={data} columns={columns} />
      </section>
    </>
  );
}
