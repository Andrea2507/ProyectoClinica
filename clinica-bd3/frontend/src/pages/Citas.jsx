import { useMemo, useState } from 'react';
import DataTable from '../components/DataTable.jsx';
import FormField from '../components/FormField.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatusMessage from '../components/StatusMessage.jsx';
import { useApiData } from '../hooks/useApiData.js';
import { patchJson, postJson } from '../services/api.js';

const initialScheduleForm = {
  paciente_id: '',
  medico_id: '',
  fecha_inicio: '',
  fecha_fin: '',
  motivo: '',
  usuario_id: '1'
};

const initialStatusForm = {
  cita_id: '',
  estado: 'confirmada',
  motivo_cancelacion: '',
  usuario_id: '1'
};

export default function Citas() {
  const { data, loading, error, load } = useApiData('/api/citas');
  const { data: pacientes } = useApiData('/api/pacientes');
  const { data: medicos } = useApiData('/api/medicos');
  const [selectedId, setSelectedId] = useState('');
  const [motivo, setMotivo] = useState('');
  const [usuarioId, setUsuarioId] = useState('1');
  const [scheduleForm, setScheduleForm] = useState(initialScheduleForm);
  const [statusForm, setStatusForm] = useState(initialStatusForm);
  const [saving, setSaving] = useState(false);
  const [actionStatus, setActionStatus] = useState({ section: '', error: '', success: '' });

  const citasCancelables = useMemo(
    () => data.filter((cita) => !['atendida', 'cancelada'].includes(cita.estado)),
    [data]
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

  function updateScheduleField(field, value) {
    setScheduleForm((current) => ({ ...current, [field]: value }));
  }

  function updateStatusField(field, value) {
    setStatusForm((current) => ({ ...current, [field]: value }));
  }

  function updateFechaInicio(value) {
    setScheduleForm((current) => {
      if (!value) {
        return { ...current, fecha_inicio: value, fecha_fin: '' };
      }

      const fin = new Date(value);
      fin.setMinutes(fin.getMinutes() + 30);

      return {
        ...current,
        fecha_inicio: value,
        fecha_fin: fin.toISOString().slice(0, 16)
      };
    });
  }

  async function handleSchedule(event) {
    event.preventDefault();
    setSaving(true);
    clearAction('schedule');

    const inicio = new Date(scheduleForm.fecha_inicio);
    const fin = new Date(scheduleForm.fecha_fin);

    if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) {
      setActionError('schedule', 'Selecciona una fecha de inicio y una fecha de fin validas.');
      setSaving(false);
      return;
    }

    if (inicio >= fin) {
      setActionError('schedule', 'La fecha de inicio debe ser menor que la fecha de fin.');
      setSaving(false);
      return;
    }

    if (!scheduleForm.motivo.trim()) {
      setActionError('schedule', 'Ingresa el motivo de la cita.');
      setSaving(false);
      return;
    }

    try {
      await postJson('/api/citas', {
        paciente_id: Number(scheduleForm.paciente_id),
        medico_id: Number(scheduleForm.medico_id),
        fecha_inicio: scheduleForm.fecha_inicio,
        fecha_fin: scheduleForm.fecha_fin,
        motivo: scheduleForm.motivo,
        usuario_id: Number(scheduleForm.usuario_id)
      });
      setActionSuccess('schedule', 'Cita agendada correctamente.');
      setScheduleForm(initialScheduleForm);
      await load();
    } catch (err) {
      setActionError('schedule', err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleCancel(event) {
    event.preventDefault();
    setSaving(true);
    clearAction('cancel');

    const cita = data.find((item) => Number(item.id) === Number(selectedId));

    if (cita?.estado === 'atendida') {
      setActionError('cancel', 'No puedes cancelar una cita que ya fue atendida.');
      setSaving(false);
      return;
    }

    if (!motivo.trim()) {
      setActionError('cancel', 'Ingresa el motivo de cancelacion.');
      setSaving(false);
      return;
    }

    try {
      await postJson(`/api/citas/${selectedId}/cancelar`, {
        motivo_cancelacion: motivo,
        usuario_id: Number(usuarioId)
      });
      setActionSuccess('cancel', 'Cita cancelada correctamente.');
      setSelectedId('');
      setMotivo('');
      await load();
    } catch (err) {
      setActionError('cancel', err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(event) {
    event.preventDefault();
    setSaving(true);
    clearAction('status');

    if (statusForm.estado === 'cancelada' && !statusForm.motivo_cancelacion.trim()) {
      setActionError('status', 'Ingresa el motivo de cancelacion.');
      setSaving(false);
      return;
    }

    try {
      await patchJson(`/api/citas/${statusForm.cita_id}/estado`, {
        estado: statusForm.estado,
        motivo_cancelacion: statusForm.motivo_cancelacion,
        usuario_id: Number(statusForm.usuario_id)
      });
      setActionSuccess('status', 'Estado actualizado correctamente.');
      setStatusForm(initialStatusForm);
      await load();
    } catch (err) {
      setActionError('status', err.message);
    } finally {
      setSaving(false);
    }
  }

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'fecha_inicio', label: 'Inicio' },
    { key: 'fecha_fin', label: 'Fin' },
    { key: 'estado', label: 'Estado', render: (row) => <span className={`state-badge ${row.estado}`}>{row.estado}</span> },
    { key: 'paciente', label: 'Paciente' },
    { key: 'medico', label: 'Medico' },
    { key: 'motivo', label: 'Motivo' },
    {
      key: 'accion',
      label: 'Accion',
      render: (row) => (
        <button
          className="secondary"
          disabled={row.estado === 'atendida'}
          title={row.estado === 'atendida' ? 'No puedes cancelar una cita ya atendida' : 'Cancelar cita'}
          onClick={() => setSelectedId(row.id)}
        >
          {row.estado === 'atendida' ? 'Atendida' : 'Cancelar'}
        </button>
      )
    }
  ];

  return (
    <>
      <PageHeader title="Citas" description="Agenda de citas y cancelacion con procedimiento almacenado." />

      <section className="form-panel">
        <div className="panel-title-row">
          <div>
            <h2>Agendar cita</h2>
            <p className="panel-help">Selecciona paciente y medico desde la lista. La hora final se propone 30 minutos despues del inicio.</p>
          </div>
        </div>
        <StatusMessage
          error={actionStatus.section === 'schedule' ? actionStatus.error : ''}
          success={actionStatus.section === 'schedule' ? actionStatus.success : ''}
          compact
        />
        <form onSubmit={handleSchedule} className="form-grid">
          <FormField label="Paciente">
            <select value={scheduleForm.paciente_id} onChange={(event) => updateScheduleField('paciente_id', event.target.value)} required>
              <option value="">Seleccione paciente</option>
              {pacientes.map((paciente) => (
                <option key={paciente.id} value={paciente.id}>
                  {paciente.id} - {paciente.nombres} {paciente.apellidos}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Medico">
            <select value={scheduleForm.medico_id} onChange={(event) => updateScheduleField('medico_id', event.target.value)} required>
              <option value="">Seleccione medico</option>
              {medicos.map((medico) => (
                <option key={medico.id} value={medico.id}>
                  {medico.id} - {medico.nombres} {medico.apellidos} ({medico.especialidad})
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Inicio">
            <input type="datetime-local" value={scheduleForm.fecha_inicio} onChange={(event) => updateFechaInicio(event.target.value)} required />
          </FormField>
          <FormField label="Fin">
            <input type="datetime-local" value={scheduleForm.fecha_fin} onChange={(event) => updateScheduleField('fecha_fin', event.target.value)} required />
          </FormField>
          <FormField label="Motivo">
            <input value={scheduleForm.motivo} onChange={(event) => updateScheduleField('motivo', event.target.value)} required />
          </FormField>
          <FormField label="Usuario ID">
            <input type="number" value={scheduleForm.usuario_id} onChange={(event) => updateScheduleField('usuario_id', event.target.value)} required />
          </FormField>
          <button disabled={saving}>{saving ? 'Guardando...' : 'Agendar cita'}</button>
        </form>
      </section>

      <section className="form-panel">
        <div className="panel-title-row">
          <div>
            <h2>Cancelar cita</h2>
            <p className="panel-help">Solo se muestran citas que todavia pueden cancelarse.</p>
          </div>
          <span className="counter-pill">{citasCancelables.length}</span>
        </div>
        <StatusMessage
          error={actionStatus.section === 'cancel' ? actionStatus.error : ''}
          success={actionStatus.section === 'cancel' ? actionStatus.success : ''}
          compact
        />
        <form onSubmit={handleCancel} className="form-grid">
          <FormField label="Cita">
            <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)} required>
              <option value="">Seleccione una cita</option>
              {citasCancelables.map((cita) => (
                <option key={cita.id} value={cita.id}>
                  {cita.id} - {cita.paciente} con {cita.medico} ({cita.estado})
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Usuario ID">
            <input type="number" value={usuarioId} onChange={(event) => setUsuarioId(event.target.value)} required />
          </FormField>
          <FormField label="Motivo de cancelacion">
            <input value={motivo} onChange={(event) => setMotivo(event.target.value)} required />
          </FormField>
          <button disabled={saving}>{saving ? 'Cancelando...' : 'Confirmar cancelacion'}</button>
        </form>
      </section>

      <section className="form-panel">
        <div className="panel-title-row">
          <div>
            <h2>Cambiar estado</h2>
            <p className="panel-help">Actualiza el ciclo de vida de una cita y registra la operacion en auditoria.</p>
          </div>
        </div>
        <StatusMessage
          error={actionStatus.section === 'status' ? actionStatus.error : ''}
          success={actionStatus.section === 'status' ? actionStatus.success : ''}
          compact
        />
        <form onSubmit={handleStatusChange} className="form-grid">
          <FormField label="Cita">
            <select value={statusForm.cita_id} onChange={(event) => updateStatusField('cita_id', event.target.value)} required>
              <option value="">Seleccione una cita</option>
              {data.map((cita) => (
                <option key={cita.id} value={cita.id}>
                  {cita.id} - {cita.paciente} con {cita.medico} ({cita.estado})
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Nuevo estado">
            <select value={statusForm.estado} onChange={(event) => updateStatusField('estado', event.target.value)} required>
              <option value="programada">programada</option>
              <option value="confirmada">confirmada</option>
              <option value="atendida">atendida</option>
              <option value="cancelada">cancelada</option>
              <option value="no_asistio">no_asistio</option>
            </select>
          </FormField>
          <FormField label="Usuario ID">
            <input type="number" value={statusForm.usuario_id} onChange={(event) => updateStatusField('usuario_id', event.target.value)} required />
          </FormField>
          <FormField label="Motivo cancelacion">
            <input
              value={statusForm.motivo_cancelacion}
              onChange={(event) => updateStatusField('motivo_cancelacion', event.target.value)}
              required={statusForm.estado === 'cancelada'}
            />
          </FormField>
          <button disabled={saving}>{saving ? 'Actualizando...' : 'Actualizar estado'}</button>
        </form>
      </section>

      <section className="report-panel">
        <div className="panel-title-row">
          <div>
            <h2>Agenda registrada</h2>
            <p className="panel-help">Listado completo de citas con paciente, medico, estado y accion disponible.</p>
          </div>
          <span className="counter-pill">{data.length}</span>
        </div>
        <StatusMessage loading={loading} error={error} empty={!loading && !data.length} compact />
        <DataTable data={data} columns={columns} />
      </section>
    </>
  );
}
