import { useState } from 'react';
import DataTable from '../components/DataTable.jsx';
import FormField from '../components/FormField.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatusMessage from '../components/StatusMessage.jsx';
import { useApiData } from '../hooks/useApiData.js';
import { postJson } from '../services/api.js';

const diasSemana = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miercoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sabado' },
  { value: 7, label: 'Domingo' }
];

const initialForm = {
  especialidad_id: '',
  nombres: '',
  apellidos: '',
  colegiado: '',
  telefono: '',
  email: '',
  horarios: [
    {
      dia_semana: '1',
      hora_inicio: '08:00',
      hora_fin: '16:00'
    }
  ]
};

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'nombres', label: 'Nombres' },
  { key: 'apellidos', label: 'Apellidos' },
  { key: 'colegiado', label: 'Colegiado' },
  { key: 'especialidad', label: 'Especialidad' },
  { key: 'telefono', label: 'Telefono' },
  { key: 'email', label: 'Email' }
];

export default function Medicos() {
  const { data, loading, error, load } = useApiData('/api/medicos');
  const { data: especialidades } = useApiData('/api/medicos/especialidades');
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ error: '', success: '' });

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateHorario(index, field, value) {
    setForm((current) => ({
      ...current,
      horarios: current.horarios.map((horario, currentIndex) => (
        currentIndex === index ? { ...horario, [field]: value } : horario
      ))
    }));
  }

  function addHorario() {
    setForm((current) => ({
      ...current,
      horarios: [
        ...current.horarios,
        { dia_semana: '1', hora_inicio: '08:00', hora_fin: '16:00' }
      ]
    }));
  }

  function removeHorario(index) {
    setForm((current) => ({
      ...current,
      horarios: current.horarios.filter((_, currentIndex) => currentIndex !== index)
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setStatus({ error: '', success: '' });

    try {
      await postJson('/api/medicos', {
        ...form,
        especialidad_id: Number(form.especialidad_id),
        horarios: form.horarios.map((horario) => ({
          dia_semana: Number(horario.dia_semana),
          hora_inicio: horario.hora_inicio,
          hora_fin: horario.hora_fin
        }))
      });
      setForm(initialForm);
      setStatus({ error: '', success: 'Medico registrado correctamente.' });
      await load();
    } catch (err) {
      setStatus({ error: err.message, success: '' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader title="Medicos" description="Registro de medicos, especialidad y horarios de atencion." />

      <section className="form-panel">
        <div className="panel-title-row">
          <div>
            <h2>Registrar medico</h2>
            <p className="panel-help">Asocia una especialidad y define uno o varios horarios semanales.</p>
          </div>
        </div>
        <StatusMessage error={status.error} success={status.success} compact />
        <form onSubmit={handleSubmit} className="form-grid">
          <FormField label="Especialidad">
            <select value={form.especialidad_id} onChange={(event) => updateField('especialidad_id', event.target.value)} required>
              <option value="">Seleccione especialidad</option>
              {especialidades.map((especialidad) => (
                <option key={especialidad.id} value={especialidad.id}>
                  {especialidad.nombre}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Nombres">
            <input value={form.nombres} onChange={(event) => updateField('nombres', event.target.value)} required />
          </FormField>
          <FormField label="Apellidos">
            <input value={form.apellidos} onChange={(event) => updateField('apellidos', event.target.value)} required />
          </FormField>
          <FormField label="Colegiado">
            <input value={form.colegiado} onChange={(event) => updateField('colegiado', event.target.value)} required />
          </FormField>
          <FormField label="Telefono">
            <input value={form.telefono} onChange={(event) => updateField('telefono', event.target.value)} />
          </FormField>
          <FormField label="Email">
            <input type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} />
          </FormField>

          <div className="form-wide">
            <div className="panel-title-row compact-row">
              <h3>Horarios</h3>
              <button type="button" className="secondary" onClick={addHorario}>Agregar horario</button>
            </div>
            {form.horarios.map((horario, index) => (
              <div className="inline-grid" key={`${horario.dia_semana}-${index}`}>
                <FormField label="Dia">
                  <select value={horario.dia_semana} onChange={(event) => updateHorario(index, 'dia_semana', event.target.value)} required>
                    {diasSemana.map((dia) => (
                      <option key={dia.value} value={dia.value}>{dia.label}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Inicio">
                  <input type="time" value={horario.hora_inicio} onChange={(event) => updateHorario(index, 'hora_inicio', event.target.value)} required />
                </FormField>
                <FormField label="Fin">
                  <input type="time" value={horario.hora_fin} onChange={(event) => updateHorario(index, 'hora_fin', event.target.value)} required />
                </FormField>
                <button
                  type="button"
                  className="secondary"
                  disabled={form.horarios.length === 1}
                  onClick={() => removeHorario(index)}
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>

          <button disabled={saving}>{saving ? 'Guardando...' : 'Registrar medico'}</button>
        </form>
      </section>

      <section className="report-panel">
        <div className="panel-title-row">
          <div>
            <h2>Medicos registrados</h2>
            <p className="panel-help">Revisa el medico, su colegiado y la especialidad asignada.</p>
          </div>
          <span className="counter-pill">{data.length}</span>
        </div>
        <StatusMessage loading={loading} error={error} empty={!loading && !data.length} compact />
        <DataTable data={data} columns={columns} />
      </section>
    </>
  );
}
