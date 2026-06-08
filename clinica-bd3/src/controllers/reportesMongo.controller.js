const HistorialClinico = require('../models/historialClinico.model');
const pool = require('../config/postgres');

function calcularEdad(fechaNacimiento) {
  const nacimiento = new Date(fechaNacimiento);
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();

  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad -= 1;
  }

  return edad;
}

function obtenerGrupoEtario(edad) {
  if (edad < 18) return 'Ninos';
  if (edad < 60) return 'Adultos';
  return 'Adultos mayores';
}

async function topDiagnosticos(req, res) {
  try {
    const fechaInicio = new Date();
    fechaInicio.setMonth(fechaInicio.getMonth() - 3);

    const resultado = await HistorialClinico.aggregate([
      {
        $match: {
          fecha_registro: { $gte: fechaInicio }
        }
      },
      {
        $unwind: "$diagnosticos"
      },
      {
        $group: {
          _id: {
            especialidad: "$especialidad",
            diagnostico: "$diagnosticos.descripcion"
          },
          cantidad: { $sum: 1 }
        }
      },
      {
        $sort: {
          "_id.especialidad": 1,
          cantidad: -1
        }
      },
      {
        $group: {
          _id: "$_id.especialidad",
          diagnosticos: {
            $push: {
              diagnostico: "$_id.diagnostico",
              cantidad: "$cantidad"
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          especialidad: "$_id",
          diagnosticos: { $slice: ["$diagnosticos", 5] }
        }
      },
      {
        $sort: {
          especialidad: 1
        }
      }
    ]);

    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener top diagnosticos',
      error: error.message
    });
  }
}

async function medicamentosPorEspecialidad(req, res) {
  try {
    const resultado = await HistorialClinico.aggregate([
      {
        $unwind: "$medicamentos"
      },
      {
        $group: {
          _id: {
            especialidad: "$especialidad",
            medicamento: "$medicamentos.nombre"
          },
          cantidad: { $sum: 1 }
        }
      },
      {
        $sort: {
          "_id.especialidad": 1,
          cantidad: -1
        }
      },
      {
        $group: {
          _id: "$_id.especialidad",
          medicamentos: {
            $push: {
              nombre: "$_id.medicamento",
              cantidad: "$cantidad"
            }
          },
          total_prescripciones: { $sum: "$cantidad" }
        }
      },
      {
        $project: {
          _id: 0,
          especialidad: "$_id",
          total_prescripciones: 1,
          medicamentos: {
            $map: {
              input: "$medicamentos",
              as: "med",
              in: {
                nombre: "$$med.nombre",
                cantidad: "$$med.cantidad",
                porcentaje: {
                  $round: [
                    {
                      $multiply: [
                        {
                          $divide: ["$$med.cantidad", "$total_prescripciones"]
                        },
                        100
                      ]
                    },
                    2
                  ]
                }
              }
            }
          }
        }
      }
    ]);

    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener medicamentos por especialidad',
      error: error.message
    });
  }
}

async function signosVitalesPorGrupo(req, res) {
  try {
    const pacientes = await pool.query('SELECT id, fecha_nacimiento FROM pacientes');
    const edadesPorPaciente = new Map(
      pacientes.rows.map((paciente) => [paciente.id, calcularEdad(paciente.fecha_nacimiento)])
    );
    const historiales = await HistorialClinico.find().lean();
    const acumulados = {};

    for (const historial of historiales) {
      const edad = edadesPorPaciente.get(historial.paciente_id);
      const grupo = obtenerGrupoEtario(edad ?? 0);

      if (!acumulados[grupo]) {
        acumulados[grupo] = {
          grupo_etario: grupo,
          total_historiales: 0,
          frecuencia_cardiaca: 0,
          temperatura: 0,
          peso: 0,
          saturacion_oxigeno: 0
        };
      }

      acumulados[grupo].total_historiales += 1;
      acumulados[grupo].frecuencia_cardiaca += historial.signos_vitales?.frecuencia_cardiaca || 0;
      acumulados[grupo].temperatura += historial.signos_vitales?.temperatura || 0;
      acumulados[grupo].peso += historial.signos_vitales?.peso || 0;
      acumulados[grupo].saturacion_oxigeno += historial.signos_vitales?.saturacion_oxigeno || 0;
    }

    const resultado = Object.values(acumulados).map((grupo) => ({
      grupo_etario: grupo.grupo_etario,
      promedio_frecuencia_cardiaca: Number((grupo.frecuencia_cardiaca / grupo.total_historiales).toFixed(2)),
      promedio_temperatura: Number((grupo.temperatura / grupo.total_historiales).toFixed(2)),
      promedio_peso: Number((grupo.peso / grupo.total_historiales).toFixed(2)),
      promedio_saturacion_oxigeno: Number((grupo.saturacion_oxigeno / grupo.total_historiales).toFixed(2)),
      total_historiales: grupo.total_historiales
    })).sort((a, b) => a.grupo_etario.localeCompare(b.grupo_etario));

    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener signos vitales por grupo',
      error: error.message
    });
  }
}

async function tiempoPromedioConsultas(req, res) {
  try {
    const resultado = await HistorialClinico.aggregate([
      {
        $sort: {
          paciente_id: 1,
          fecha_registro: 1
        }
      },
      {
        $group: {
          _id: "$paciente_id",
          fechas: { $push: "$fecha_registro" },
          total_consultas: { $sum: 1 }
        }
      },
      {
        $project: {
          paciente_id: "$_id",
          total_consultas: 1,
          intervalos_dias: {
            $map: {
              input: { $range: [1, { $size: "$fechas" }] },
              as: "idx",
              in: {
                $dateDiff: {
                  startDate: { $arrayElemAt: ["$fechas", { $subtract: ["$$idx", 1] }] },
                  endDate: { $arrayElemAt: ["$fechas", "$$idx"] },
                  unit: "day"
                }
              }
            }
          },
          _id: 0
        }
      },
      {
        $project: {
          paciente_id: 1,
          total_consultas: 1,
          promedio_dias_entre_consultas: {
            $cond: [
              { $gt: [{ $size: "$intervalos_dias" }, 0] },
              { $round: [{ $avg: "$intervalos_dias" }, 2] },
              null
            ]
          }
        }
      },
      {
        $sort: {
          promedio_dias_entre_consultas: 1,
          paciente_id: 1
        }
      }
    ]);

    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener tiempo promedio entre consultas',
      error: error.message
    });
  }
}

async function resumenClinico(req, res) {
  try {
    const resultado = await HistorialClinico.aggregate([
      {
        $facet: {
          top_diagnosticos: [
            {
              $unwind: "$diagnosticos"
            },
            {
              $group: {
                _id: "$diagnosticos.descripcion",
                cantidad: { $sum: 1 }
              }
            },
            {
              $sort: {
                cantidad: -1
              }
            },
            {
              $limit: 5
            },
            {
              $project: {
                _id: 0,
                diagnostico: "$_id",
                cantidad: 1
              }
            }
          ],

          medicamentos_frecuentes: [
            {
              $unwind: "$medicamentos"
            },
            {
              $group: {
                _id: "$medicamentos.nombre",
                cantidad: { $sum: 1 }
              }
            },
            {
              $sort: {
                cantidad: -1
              }
            },
            {
              $limit: 5
            },
            {
              $project: {
                _id: 0,
                medicamento: "$_id",
                cantidad: 1
              }
            }
          ],

          historiales_por_especialidad: [
            {
              $group: {
                _id: "$especialidad",
                total_historiales: { $sum: 1 }
              }
            },
            {
              $sort: {
                total_historiales: -1
              }
            },
            {
              $project: {
                _id: 0,
                especialidad: "$_id",
                total_historiales: 1
              }
            }
          ],

          promedios_signos_vitales: [
            {
              $group: {
                _id: null,
                promedio_frecuencia_cardiaca: {
                  $avg: "$signos_vitales.frecuencia_cardiaca"
                },
                promedio_temperatura: {
                  $avg: "$signos_vitales.temperatura"
                },
                promedio_peso: {
                  $avg: "$signos_vitales.peso"
                },
                promedio_saturacion_oxigeno: {
                  $avg: "$signos_vitales.saturacion_oxigeno"
                }
              }
            },
            {
              $project: {
                _id: 0,
                promedio_frecuencia_cardiaca: {
                  $round: ["$promedio_frecuencia_cardiaca", 2]
                },
                promedio_temperatura: {
                  $round: ["$promedio_temperatura", 2]
                },
                promedio_peso: {
                  $round: ["$promedio_peso", 2]
                },
                promedio_saturacion_oxigeno: {
                  $round: ["$promedio_saturacion_oxigeno", 2]
                }
              }
            }
          ]
        }
      }
    ]);

    res.json(resultado[0]);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener resumen clinico',
      error: error.message
    });
  }
}

module.exports = {
  topDiagnosticos,
  medicamentosPorEspecialidad,
  signosVitalesPorGrupo,
  tiempoPromedioConsultas,
  resumenClinico
};
