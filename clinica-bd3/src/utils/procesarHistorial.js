function limpiarTexto(valor) {
  if (typeof valor !== 'string') {
    return valor;
  }

  return valor.trim().replace(/\s+/g, ' ');
}

function procesarHistorialClinico(datos = {}) {
  return {
    ...datos,
    especialidad: limpiarTexto(datos.especialidad),
    motivo_consulta: limpiarTexto(datos.motivo_consulta),
    notas_adicionales: limpiarTexto(datos.notas_adicionales),
    diagnosticos: Array.isArray(datos.diagnosticos)
      ? datos.diagnosticos.map((diagnostico) => ({
          ...diagnostico,
          codigo: limpiarTexto(diagnostico.codigo),
          descripcion: limpiarTexto(diagnostico.descripcion),
          tipo: diagnostico.tipo || 'principal'
        }))
      : [],
    medicamentos: Array.isArray(datos.medicamentos)
      ? datos.medicamentos.map((medicamento) => ({
          ...medicamento,
          nombre: limpiarTexto(medicamento.nombre),
          dosis: limpiarTexto(medicamento.dosis),
          frecuencia: limpiarTexto(medicamento.frecuencia),
          duracion: limpiarTexto(medicamento.duracion),
          indicaciones: limpiarTexto(medicamento.indicaciones)
        }))
      : [],
    examenes_solicitados: Array.isArray(datos.examenes_solicitados)
      ? datos.examenes_solicitados.map((examen) => ({
          ...examen,
          nombre: limpiarTexto(examen.nombre),
          descripcion: limpiarTexto(examen.descripcion),
          prioridad: examen.prioridad || 'normal'
        }))
      : [],
    fecha_registro: datos.fecha_registro || new Date()
  };
}

module.exports = procesarHistorialClinico;