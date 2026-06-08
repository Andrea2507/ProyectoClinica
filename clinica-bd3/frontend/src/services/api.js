export const API_BASE = 'http://localhost:3000';

function humanizeApiError(message) {
  if (!message) {
    return 'Ocurrio un error al consumir la API.';
  }

  const normalized = message.toLowerCase();

  if (normalized.includes('citas_check') || normalized.includes('fecha_inicio < fecha_fin')) {
    return 'La fecha de inicio debe ser menor que la fecha de fin.';
  }

  if (normalized.includes('no se puede cancelar una cita atendida')) {
    return 'No puedes cancelar una cita que ya fue atendida.';
  }

  if (normalized.includes('pago excede el saldo')) {
    return 'El monto del pago no puede exceder el saldo pendiente de la factura.';
  }

  if (normalized.includes('monto debe ser positivo')) {
    return 'El monto debe ser mayor que cero.';
  }

  if (normalized.includes('facturas anuladas')) {
    return 'No puedes registrar pagos sobre facturas anuladas.';
  }

  if (normalized.includes('duplicate key') || normalized.includes('unique constraint')) {
    return 'Ya existe un registro con esos datos. Revisa identificadores o numeros únicos.';
  }

  if (normalized.includes('json')) {
    return message;
  }

  return message;
}

export async function fetchJson(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.error || data?.mensaje || 'Error al consumir la API';
    throw new Error(humanizeApiError(message));
  }

  return data;
}

export function postJson(path, body) {
  return fetchJson(path, {
    method: 'POST',
    body: JSON.stringify(body)
  });
}

export function patchJson(path, body) {
  return fetchJson(path, {
    method: 'PATCH',
    body: JSON.stringify(body)
  });
}
