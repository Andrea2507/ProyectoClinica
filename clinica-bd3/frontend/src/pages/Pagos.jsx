import { useMemo, useState } from 'react';
import DataTable from '../components/DataTable.jsx';
import FormField from '../components/FormField.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatusMessage from '../components/StatusMessage.jsx';
import { useApiData } from '../hooks/useApiData.js';
import { postJson } from '../services/api.js';

const initialPaymentForm = {
  factura_id: '',
  monto: '',
  metodo_pago: 'efectivo',
  referencia: '',
  usuario_id: '1'
};

const initialFacturaForm = {
  paciente_id: '',
  cita_id: '',
  numero: `FAC-${Date.now().toString().slice(-6)}`,
  descuento: '0',
  usuario_id: '1'
};

const initialServiceLine = {
  servicio_id: '',
  cantidad: 1
};

function money(value) {
  return Number(value || 0).toFixed(2);
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('es-GT');
}

function normalizeEstado(estado) {
  return String(estado || 'pendiente').toLowerCase();
}

function EstadoBadge({ estado }) {
  const current = normalizeEstado(estado);
  const label = {
    pendiente: 'Pendiente',
    pagada_parcial: 'Pago parcial',
    pagada: 'Pagada',
    anulada: 'Anulada'
  }[current] || estado;

  return <span className={`state-badge ${current}`}>{label}</span>;
}

export default function Pagos() {
  const { data: pagos, loading, error, load } = useApiData('/api/pagos');
  const { data: facturas, loading: loadingFacturas, error: facturasError, load: loadFacturas } = useApiData('/api/facturas');
  const { data: pacientes } = useApiData('/api/pacientes');
  const { data: citas } = useApiData('/api/citas');
  const { data: servicios } = useApiData('/api/servicios');
  const [form, setForm] = useState(initialPaymentForm);
  const [facturaForm, setFacturaForm] = useState(initialFacturaForm);
  const [serviceLines, setServiceLines] = useState([initialServiceLine]);
  const [saving, setSaving] = useState(false);
  const [actionStatus, setActionStatus] = useState({ section: '', error: '', success: '' });

  const facturasPendientes = useMemo(
    () => facturas.filter((factura) => Number(factura.saldo_pendiente || 0) > 0 && normalizeEstado(factura.estado) !== 'anulada'),
    [facturas]
  );

  const facturasPagadas = useMemo(
    () => facturas.filter((factura) => normalizeEstado(factura.estado) === 'pagada' || Number(factura.saldo_pendiente || 0) <= 0),
    [facturas]
  );

  const totalPendiente = useMemo(
    () => facturasPendientes.reduce((total, factura) => total + Number(factura.saldo_pendiente || 0), 0),
    [facturasPendientes]
  );

  const totalCobrado = useMemo(
    () => facturas.reduce((total, factura) => total + Number(factura.total_pagado || 0), 0),
    [facturas]
  );

  const totalFacturado = useMemo(
    () => facturas.reduce((total, factura) => total + Number(factura.total || 0), 0),
    [facturas]
  );

  const selectedFactura = useMemo(
    () => facturas.find((item) => Number(item.id) === Number(form.factura_id)),
    [facturas, form.factura_id]
  );

  const citasDelPaciente = useMemo(() => {
    if (!facturaForm.paciente_id) return citas;
    return citas.filter((cita) => Number(cita.paciente_id) === Number(facturaForm.paciente_id));
  }, [citas, facturaForm.paciente_id]);

  const subtotal = useMemo(() => {
    return serviceLines.reduce((total, line) => {
      const servicio = servicios.find((item) => Number(item.id) === Number(line.servicio_id));
      return total + Number(servicio?.precio || 0) * Number(line.cantidad || 0);
    }, 0);
  }, [serviceLines, servicios]);

  const descuento = Number(facturaForm.descuento || 0);
  const totalFactura = Math.max(subtotal - descuento, 0);

  const baseFacturaColumns = [
    { key: 'numero', label: 'Factura' },
    { key: 'paciente', label: 'Paciente' },
    { key: 'fecha_emision', label: 'Fecha', render: (row) => formatDate(row.fecha_emision) },
    { key: 'total', label: 'Total', render: (row) => `Q${money(row.total)}` },
    { key: 'total_pagado', label: 'Pagado', render: (row) => `Q${money(row.total_pagado)}` },
    { key: 'saldo_pendiente', label: 'Saldo', render: (row) => `Q${money(row.saldo_pendiente)}` },
    { key: 'estado', label: 'Estado', render: (row) => <EstadoBadge estado={row.estado} /> }
  ];

  const facturasPendientesColumns = [
    ...baseFacturaColumns,
    {
      key: 'accion',
      label: 'Accion',
      render: (row) =>
        row.saldo_pendiente > 0 ? (
          <button className="secondary compact-button" onClick={() => selectFactura(row)}>
            Pagar saldo
          </button>
        ) : (
          <span className="muted">Sin saldo</span>
      )
    }
  ];

  function updatePaymentField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function clearAction(section) {
    setActionStatus({ section, error: '', success: '' });
  }

  function setActionError(section, message) {
    setActionStatus({ section, error: message, success: '' });
  }

  function setActionSuccess(section, message) {
    setActionStatus({ section, error: '', success: message });
  }

  function updateFacturaField(field, value) {
    setFacturaForm((current) => ({ ...current, [field]: value }));
  }

  function updateServiceLine(index, field, value) {
    setServiceLines((current) =>
      current.map((line, lineIndex) =>
        lineIndex === index ? { ...line, [field]: value } : line
      )
    );
  }

  function addServiceLine() {
    setServiceLines((current) => [...current, initialServiceLine]);
  }

  function removeServiceLine(index) {
    setServiceLines((current) => current.filter((_, lineIndex) => lineIndex !== index));
  }

  function selectFactura(factura) {
    setForm((current) => ({
      ...current,
      factura_id: factura.id,
      monto: String(factura.saldo_pendiente),
      referencia: `PAGO-${factura.numero}`
    }));
  }

  async function refreshBillingData() {
    await load();
    await loadFacturas();
  }

  async function handleFacturaSubmit(event) {
    event.preventDefault();
    setSaving(true);
    clearAction('factura');

    const serviciosFactura = serviceLines
      .filter((line) => line.servicio_id)
      .map((line) => ({
        servicio_id: Number(line.servicio_id),
        cantidad: Number(line.cantidad)
      }));

    if (!facturaForm.paciente_id) {
      setActionError('factura', 'Selecciona el paciente al que se le emitira la factura.');
      setSaving(false);
      return;
    }

    if (!serviciosFactura.length) {
      setActionError('factura', 'Agrega al menos un servicio a la factura.');
      setSaving(false);
      return;
    }

    if (serviciosFactura.some((servicio) => servicio.cantidad <= 0)) {
      setActionError('factura', 'La cantidad de cada servicio debe ser mayor que cero.');
      setSaving(false);
      return;
    }

    if (descuento < 0 || descuento > subtotal) {
      setActionError('factura', 'El descuento no puede ser negativo ni mayor que el subtotal.');
      setSaving(false);
      return;
    }

    try {
      const response = await postJson('/api/facturas', {
        paciente_id: Number(facturaForm.paciente_id),
        cita_id: facturaForm.cita_id ? Number(facturaForm.cita_id) : null,
        numero: facturaForm.numero,
        descuento,
        servicios: serviciosFactura,
        usuario_id: Number(facturaForm.usuario_id)
      });

      setActionSuccess('factura', `Factura generada correctamente. ID: ${response.factura?.id || ''}`);
      setFacturaForm({
        ...initialFacturaForm,
        numero: `FAC-${Date.now().toString().slice(-6)}`
      });
      setServiceLines([initialServiceLine]);
      await refreshBillingData();
    } catch (err) {
      setActionError('factura', err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handlePaymentSubmit(event) {
    event.preventDefault();
    setSaving(true);
    clearAction('pago');

    const factura = facturas.find((item) => Number(item.id) === Number(form.factura_id));

    if (!factura) {
      setActionError('pago', 'Selecciona una factura pendiente.');
      setSaving(false);
      return;
    }

    if (Number(form.monto) <= 0) {
      setActionError('pago', 'El monto del pago debe ser mayor que cero.');
      setSaving(false);
      return;
    }

    if (Number(form.monto) > Number(factura.saldo_pendiente)) {
      setActionError('pago', 'El monto del pago no puede exceder el saldo pendiente de la factura.');
      setSaving(false);
      return;
    }

    if (!form.referencia.trim()) {
      setActionError('pago', 'Ingresa una referencia para el pago.');
      setSaving(false);
      return;
    }

    try {
      await postJson('/api/pagos', {
        factura_id: Number(form.factura_id),
        monto: Number(form.monto),
        metodo_pago: form.metodo_pago,
        referencia: form.referencia,
        usuario_id: Number(form.usuario_id)
      });

      setActionSuccess('pago', 'Pago registrado correctamente.');
      setForm(initialPaymentForm);
      await refreshBillingData();
    } catch (err) {
      setActionError('pago', err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader title="Pagos y facturas" description="Modulo financiero para emitir facturas, revisar saldos y registrar pagos." />

      <section className="billing-summary">
        <article>
          <small>Total emitidas</small>
          <strong>{facturas.length}</strong>
          <span>Facturas registradas</span>
        </article>
        <article>
          <span>Facturas pendientes</span>
          <strong>{facturasPendientes.length}</strong>
          <small>Requieren pago</small>
        </article>
        <article>
          <span>Saldo pendiente</span>
          <strong>Q{money(totalPendiente)}</strong>
          <small>Por cobrar</small>
        </article>
        <article>
          <span>Total cobrado</span>
          <strong>Q{money(totalCobrado)}</strong>
          <small>Pagos aplicados</small>
        </article>
        <article>
          <span>Total facturado</span>
          <strong>Q{money(totalFacturado)}</strong>
          <small>Antes de pagos</small>
        </article>
      </section>

      <StatusMessage loading={loading || loadingFacturas} error={error || facturasError} compact />

      <section className="report-grid two-columns">
        <article className="report-panel">
          <div className="panel-title-row">
            <div>
              <h2>Facturas no pagadas</h2>
              <p className="panel-help">Aqui aparecen las facturas pendientes o con pago parcial. Usa "Pagar saldo" para llenar el formulario de pago automaticamente.</p>
            </div>
            <span className="counter-pill">{facturasPendientes.length}</span>
          </div>
          {facturasPendientes.length ? (
            <DataTable data={facturasPendientes} columns={facturasPendientesColumns} />
          ) : (
            <p className="empty-panel">No hay facturas pendientes de pago.</p>
          )}
        </article>

        <article className="report-panel">
          <div className="panel-title-row">
            <div>
              <h2>Facturas pagadas</h2>
              <p className="panel-help">Estas facturas ya no tienen saldo pendiente.</p>
            </div>
            <span className="counter-pill success">{facturasPagadas.length}</span>
          </div>
          {facturasPagadas.length ? (
            <DataTable data={facturasPagadas} columns={baseFacturaColumns} />
          ) : (
            <p className="empty-panel">Todavia no hay facturas pagadas.</p>
          )}
        </article>
      </section>

      <section className="form-panel">
        <div className="panel-title-row">
          <div>
            <h2>Registrar pago</h2>
            <p className="panel-help">Selecciona una factura pendiente. El sistema carga el saldo para evitar pagar una factura equivocada.</p>
          </div>
          {selectedFactura ? (
            <span className="selected-pill">Saldo: Q{money(selectedFactura.saldo_pendiente)}</span>
          ) : null}
        </div>
        <StatusMessage
          error={actionStatus.section === 'pago' ? actionStatus.error : ''}
          success={actionStatus.section === 'pago' ? actionStatus.success : ''}
          compact
        />
        <form onSubmit={handlePaymentSubmit} className="form-grid">
          <FormField label="Factura pendiente">
            <select value={form.factura_id} onChange={(event) => {
              const factura = facturas.find((item) => Number(item.id) === Number(event.target.value));
              if (factura) selectFactura(factura);
            }} required>
              <option value="">Seleccione factura</option>
              {facturasPendientes.map((factura) => (
                <option key={factura.id} value={factura.id}>
                  {factura.numero} - {factura.paciente} - saldo Q{money(factura.saldo_pendiente)}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Monto">
            <input type="number" step="0.01" min="0.01" value={form.monto} onChange={(event) => updatePaymentField('monto', event.target.value)} required />
          </FormField>
          <FormField label="Metodo">
            <select value={form.metodo_pago} onChange={(event) => updatePaymentField('metodo_pago', event.target.value)}>
              <option value="efectivo">efectivo</option>
              <option value="tarjeta">tarjeta</option>
              <option value="transferencia">transferencia</option>
              <option value="cheque">cheque</option>
            </select>
          </FormField>
          <FormField label="Referencia">
            <input value={form.referencia} onChange={(event) => updatePaymentField('referencia', event.target.value)} required />
          </FormField>
          <FormField label="Usuario ID">
            <input type="number" min="1" value={form.usuario_id} onChange={(event) => updatePaymentField('usuario_id', event.target.value)} required />
          </FormField>
          <button disabled={saving}>{saving ? 'Guardando...' : 'Registrar pago'}</button>
        </form>
      </section>

      <section className="form-panel">
        <div className="panel-title-row">
          <div>
            <h2>Generar factura</h2>
            <p className="panel-help">Primero elige al paciente, luego agrega los servicios cobrados. El total se calcula automaticamente.</p>
          </div>
          <span className="selected-pill">Total: Q{money(totalFactura)}</span>
        </div>
        <StatusMessage
          error={actionStatus.section === 'factura' ? actionStatus.error : ''}
          success={actionStatus.section === 'factura' ? actionStatus.success : ''}
          compact
        />
        <form onSubmit={handleFacturaSubmit} className="form-grid wide">
          <FormField label="Paciente">
            <select value={facturaForm.paciente_id} onChange={(event) => updateFacturaField('paciente_id', event.target.value)} required>
              <option value="">Seleccione paciente</option>
              {pacientes.map((paciente) => (
                <option key={paciente.id} value={paciente.id}>
                  {paciente.id} - {paciente.nombres} {paciente.apellidos}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Cita">
            <select value={facturaForm.cita_id} onChange={(event) => updateFacturaField('cita_id', event.target.value)}>
              <option value="">Sin cita asociada</option>
              {citasDelPaciente.map((cita) => (
                <option key={cita.id} value={cita.id}>
                  {cita.id} - {cita.paciente} / {cita.medico} / {cita.estado}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Numero">
            <input value={facturaForm.numero} onChange={(event) => updateFacturaField('numero', event.target.value)} required />
          </FormField>
          <FormField label="Descuento">
            <input type="number" step="0.01" min="0" value={facturaForm.descuento} onChange={(event) => updateFacturaField('descuento', event.target.value)} required />
          </FormField>
          <FormField label="Usuario ID">
            <input type="number" min="1" value={facturaForm.usuario_id} onChange={(event) => updateFacturaField('usuario_id', event.target.value)} required />
          </FormField>

          <div className="form-wide-block">
            <div className="panel-title-row">
              <h2>Servicios</h2>
              <button type="button" className="secondary" onClick={addServiceLine}>Agregar servicio</button>
            </div>
            <div className="service-lines">
              {serviceLines.map((line, index) => {
                const servicio = servicios.find((item) => Number(item.id) === Number(line.servicio_id));
                const lineTotal = Number(servicio?.precio || 0) * Number(line.cantidad || 0);

                return (
                  <div className="service-line" key={index}>
                    <FormField label="Servicio">
                      <select value={line.servicio_id} onChange={(event) => updateServiceLine(index, 'servicio_id', event.target.value)} required>
                        <option value="">Seleccione servicio</option>
                        {servicios.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.nombre} - Q{money(item.precio)}
                          </option>
                        ))}
                      </select>
                    </FormField>
                    <FormField label="Cantidad">
                      <input type="number" min="1" value={line.cantidad} onChange={(event) => updateServiceLine(index, 'cantidad', event.target.value)} required />
                    </FormField>
                    <div className="line-total">Q{money(lineTotal)}</div>
                    <button type="button" className="secondary" onClick={() => removeServiceLine(index)} disabled={serviceLines.length === 1}>Quitar</button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="total-box">
            <span>Subtotal: Q{money(subtotal)}</span>
            <span>Descuento: Q{money(descuento)}</span>
            <strong>Total: Q{money(totalFactura)}</strong>
          </div>
          <button disabled={saving}>{saving ? 'Guardando...' : 'Generar factura'}</button>
        </form>
      </section>

      <section className="report-panel">
        <div className="panel-title-row">
          <div>
            <h2>Pagos registrados</h2>
            <p className="panel-help">Historial de pagos guardados en PostgreSQL.</p>
          </div>
          <span className="counter-pill">{pagos.length}</span>
        </div>
        {pagos.length ? <DataTable data={pagos} /> : <p className="empty-panel">No hay pagos registrados.</p>}
      </section>
    </>
  );
}
