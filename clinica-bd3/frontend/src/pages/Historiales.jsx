import { useMemo, useState } from 'react';
import DataTable from '../components/DataTable.jsx';
import FormField from '../components/FormField.jsx';
import JsonBlock from '../components/JsonBlock.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatusMessage from '../components/StatusMessage.jsx';
import { useApiData } from '../hooks/useApiData.js';
import { postJson } from '../services/api.js';

const defaultExamenes = `[
  {
    "nombre": "Hemograma",
    "descripcion": "Examen de sangre",
    "prioridad": "normal"
  }
]`;

const initialForm = {
  cita_id: '',
  paciente_id: '',
  medico_id: '',
  especialidad: 'Medicina General',
  motivo_consulta: '',
  presion_arterial: '120/80',
  frecuencia_cardiaca: '75',
  temperatura: '36.7',
  peso: '65',
  altura: '1.65',
  saturacion_oxigeno: '98',
  diagnostico_codigo: 'DX-001',
  diagnostico_descripcion: '',
  medicamento_nombre: '',
  examenes_solicitados: defaultExamenes,
  datos_especialidad: '{}',
  registrado_por: '1',
  notas_adicionales: ''
};

export default function Historiales() {
  const { data, loading, error, load } = useApiData('/api/historiales');
  const { data: pacientes } = useApiData('/api/pacientes');
  const { data: medicos } = useApiData('/api/medicos');
  const { data: citas } = useApiData('/api/citas');
  const [form, setForm] = useState(initialForm);
  const [pacienteBusqueda, setPacienteBusqueda] = useState('');
  const [saving, setSaving] = useState(false);
  const [actionStatus, setActionStatus] = useState({ section: '', error: '', success: '' });

  const citasAtendidas = useMemo(
    () => citas.filter((cita) => cita.estado === 'atendida'),
    [citas]
  );

  function clearAction(section) {
    setActionStatus({ section, error: '', success: '' });
  }

  function setActionError(section, message) {
    setActionStatus({ section, error: message, success: '' });
  }

  function setActionSuccess(section, message) {
    setActionStatus({ section, error: '', success: message });
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateCita(value) {
    const cita = citas.find((item) => Number(item.id) === Number(value));

    setForm((current) => ({
      ...current,
      cita_id: value,
      paciente_id: cita?.paciente_id ? String(cita.paciente_id) : current.paciente_id,
      medico_id: cita?.medico_id ? String(cita.medico_id) : current.medico_id,
      motivo_consulta: cita?.motivo || current.motivo_consulta
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    clearAction('create');

    let examenesSolicitados = [];
    let datosEspecialidad = {};

    try {
      examenesSolicitados = JSON.parse(form.examenes_solicitados || '[]');
      datosEspecialidad = JSON.parse(form.datos_especialidad || '{}');
    } catch (err) {
      setActionError('create', 'Los campos JSON de examenes solicitados o datos de especialidad no son validos. Revisa comillas, llaves y corchetes.');
      setSaving(false);
      return;
    }

    if (!Array.isArray(examenesSolicitados)) {
      setActionError('create', 'Examenes solicitados debe ser un arreglo JSON. Ejemplo: [{"nombre":"Hemograma","prioridad":"normal"}]');
      setSaving(false);
      return;
    }

    if (datosEspecialidad === null || Array.isArray(datosEspecialidad) || typeof datosEspecialidad !== 'object') {
      setActionError('create', 'Datos de especialidad debe ser un objeto JSON. Ejemplo: {"observacion":"Paciente estable"}');
      setSaving(false);
      return;
    }

    if (Number(form.frecuencia_cardiaca) <= 0) {
      setActionError('create', 'La frecuencia cardiaca debe ser mayor que cero.');
      setSaving(false);
      return;
    }

    if (Number(form.temperatura) <= 0 || Number(form.peso) <= 0 || Number(form.altura) <= 0) {
      setActionError('create', 'Temperatura, peso y altura deben ser valores mayores que cero.');
      setSaving(false);
      return;
    }

    if (Number(form.saturacion_oxigeno) <= 0 || Number(form.saturacion_oxigeno) > 100) {
      setActionError('create', 'La saturacion de oxigeno debe estar entre 1 y 100.');
      setSaving(false);
      return;
    }

    const body = {
      cita_id: Number(form.cita_id),
      paciente_id: Number(form.paciente_id),
      medico_id: Number(form.medico_id),
      especialidad: form.especialidad,
      motivo_consulta: form.motivo_consulta,
      signos_vitales: {
        presion_arterial: form.presion_arterial,
        frecuencia_cardiaca: Number(form.frecuencia_cardiaca),
        temperatura: Number(form.temperatura),
        peso: Number(form.peso),
        altura: Number(form.altura),
        saturacion_oxigeno: Number(form.saturacion_oxigeno)
      },
      diagnosticos: [
        {
          codigo: form.diagnostico_codigo,
          descripcion: form.diagnostico_descripcion,
          tipo: 'principal'
        }
      ],
      medicamentos: form.medicamento_nombre
        ? [
            {
              nombre: form.medicamento_nombre,
              dosis: '500 mg',
              frecuencia: 'cada 8 horas',
              duracion: '3 dias',
              indicaciones: 'Tomar con agua'
            }
          ]
        : [],
      examenes_solicitados: examenesSolicitados,
      notas_adicionales: form.notas_adicionales,
      datos_especialidad: datosEspecialidad,
      registrado_por: Number(form.registrado_por)
    };

    try {
      await postJson('/api/historiales', body);
      setActionSuccess('create', 'Historial clinico registrado correctamente.');
      setForm(initialForm);
      await load();
    } catch (err) {
      setActionError('create', err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSearchByPatient(event) {
    event.preventDefault();
    clearAction('search');
    const result = await load(`/api/historiales/paciente/${pacienteBusqueda}`);
    if (result) {
      setActionSuccess('search', 'Busqueda aplicada correctamente.');
    }
  }

  async function handleShowAll() {
    setPacienteBusqueda('');
    clearAction('search');
    const result = await load('/api/historiales');
    if (result) {
      setActionSuccess('search', 'Mostrando todos los historiales.');
    }
  }

  const columns = [
    { key: '_id', label: 'Mongo ID' },
    { key: 'cita_id', label: 'Cita' },
    { key: 'paciente_id', label: 'Paciente' },
    { key: 'medico_id', label: 'Medico' },
    { key: 'especialidad', label: 'Especialidad' },
    { key: 'motivo_consulta', label: 'Motivo' },
    { key: 'diagnosticos', label: 'Diagnosticos', render: (row) => <JsonBlock value={row.diagnosticos} /> },
    { key: 'signos_vitales', label: 'Signos vitales', render: (row) => <JsonBlock value={row.signos_vitales} /> }
  ];

  return (
    <>
      <PageHeader title="Historiales clinicos" description="Registros clinicos almacenados en MongoDB." />

      <section className="form-panel">
        <div className="panel-title-row">
          <div>
            <h2>Buscar historiales</h2>
            <p className="panel-help">Elige un paciente para ver solo sus historiales o vuelve al listado completo.</p>
          </div>
          <span className="counter-pill">{data.length}</span>
        </div>
        <StatusMessage
          error={actionStatus.section === 'search' ? actionStatus.error : ''}
          success={actionStatus.section === 'search' ? actionStatus.success : ''}
          compact
        />
        <form onSubmit={handleSearchByPatient} className="form-grid">
          <FormField label="Paciente">
            <select value={pacienteBusqueda} onChange={(event) => setPacienteBusqueda(event.target.value)} required>
              <option value="">Seleccione paciente</option>
              {pacientes.map((paciente) => (
                <option key={paciente.id} value={paciente.id}>
                  {paciente.id} - {paciente.nombres} {paciente.apellidos}
                </option>
              ))}
            </select>
          </FormField>
          <button disabled={loading}>Buscar por paciente</button>
          <button type="button" className="secondary" onClick={handleShowAll} disabled={loading}>
            Ver todos
          </button>
        </form>
      </section>

      <section className="form-panel">
        <div className="panel-title-row">
          <div>
            <h2>Registrar historial basico</h2>
            <p className="panel-help">Usa una cita atendida cuando sea posible; paciente y medico se completan automaticamente si la cita los incluye.</p>
          </div>
        </div>
        <StatusMessage
          error={actionStatus.section === 'create' ? actionStatus.error : ''}
          success={actionStatus.section === 'create' ? actionStatus.success : ''}
          compact
        />
        <form onSubmit={handleSubmit} className="form-grid wide">
          <FormField label="Cita atendida">
            <select value={form.cita_id} onChange={(event) => updateCita(event.target.value)} required>
              <option value="">Seleccione cita</option>
              {citasAtendidas.map((cita) => (
                <option key={cita.id} value={cita.id}>
                  {cita.id} - {cita.paciente} / {cita.medico}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Paciente">
            <select value={form.paciente_id} onChange={(event) => updateField('paciente_id', event.target.value)} required>
              <option value="">Seleccione paciente</option>
              {pacientes.map((paciente) => (
                <option key={paciente.id} value={paciente.id}>
                  {paciente.id} - {paciente.nombres} {paciente.apellidos}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Medico">
            <select value={form.medico_id} onChange={(event) => updateField('medico_id', event.target.value)} required>
              <option value="">Seleccione medico</option>
              {medicos.map((medico) => (
                <option key={medico.id} value={medico.id}>
                  {medico.id} - {medico.nombres} {medico.apellidos} ({medico.especialidad})
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Especialidad">
            <input value={form.especialidad} onChange={(event) => updateField('especialidad', event.target.value)} required />
          </FormField>
          <FormField label="Motivo consulta">
            <input value={form.motivo_consulta} onChange={(event) => updateField('motivo_consulta', event.target.value)} required />
          </FormField>
          <FormField label="Presion arterial">
            <input value={form.presion_arterial} onChange={(event) => updateField('presion_arterial', event.target.value)} required />
          </FormField>
          <FormField label="Frecuencia cardiaca">
            <input type="number" value={form.frecuencia_cardiaca} onChange={(event) => updateField('frecuencia_cardiaca', event.target.value)} required />
          </FormField>
          <FormField label="Temperatura">
            <input type="number" step="0.1" value={form.temperatura} onChange={(event) => updateField('temperatura', event.target.value)} required />
          </FormField>
          <FormField label="Peso">
            <input type="number" step="0.1" value={form.peso} onChange={(event) => updateField('peso', event.target.value)} required />
          </FormField>
          <FormField label="Altura">
            <input type="number" step="0.01" value={form.altura} onChange={(event) => updateField('altura', event.target.value)} required />
          </FormField>
          <FormField label="Saturacion oxigeno">
            <input type="number" value={form.saturacion_oxigeno} onChange={(event) => updateField('saturacion_oxigeno', event.target.value)} required />
          </FormField>
          <FormField label="Codigo diagnostico">
            <input value={form.diagnostico_codigo} onChange={(event) => updateField('diagnostico_codigo', event.target.value)} required />
          </FormField>
          <FormField label="Diagnostico">
            <input value={form.diagnostico_descripcion} onChange={(event) => updateField('diagnostico_descripcion', event.target.value)} required />
          </FormField>
          <FormField label="Medicamento">
            <input value={form.medicamento_nombre} onChange={(event) => updateField('medicamento_nombre', event.target.value)} />
          </FormField>
          <FormField label="Examenes solicitados JSON">
            <textarea value={form.examenes_solicitados} onChange={(event) => updateField('examenes_solicitados', event.target.value)} />
          </FormField>
          <FormField label="Datos especialidad JSON">
            <textarea value={form.datos_especialidad} onChange={(event) => updateField('datos_especialidad', event.target.value)} />
          </FormField>
          <FormField label="Registrado por">
            <input type="number" value={form.registrado_por} onChange={(event) => updateField('registrado_por', event.target.value)} required />
          </FormField>
          <FormField label="Notas">
            <textarea value={form.notas_adicionales} onChange={(event) => updateField('notas_adicionales', event.target.value)} />
          </FormField>
          <button disabled={saving}>{saving ? 'Guardando...' : 'Registrar historial'}</button>
        </form>
      </section>

      <section className="report-panel">
        <div className="panel-title-row">
          <div>
            <h2>Historiales registrados</h2>
            <p className="panel-help">Los campos clinicos complejos se muestran como JSON para conservar la estructura original de MongoDB.</p>
          </div>
          <span className="counter-pill">{data.length}</span>
        </div>
        <StatusMessage loading={loading} error={error} empty={!loading && !data.length} compact />
        <DataTable data={data} columns={columns} />
      </section>
    </>
  );
}
