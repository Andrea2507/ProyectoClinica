const HistorialClinico = require('../models/historialClinico.model');

async function topDiagnosticos(req, res) {
  try {
    const resultado = await HistorialClinico.aggregate([
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
    const resultado = await HistorialClinico.aggregate([
      {
        $addFields: {
          grupo_etario: {
            $switch: {
              branches: [
                {
                  case: { $lte: ["$paciente_id", 8] },
                  then: "Ninos"
                },
                {
                  case: { $lte: ["$paciente_id", 20] },
                  then: "Adultos"
                }
              ],
              default: "Adultos mayores"
            }
          }
        }
      },
      {
        $group: {
          _id: "$grupo_etario",
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
          },
          total_historiales: {
            $sum: 1
          }
        }
      },
      {
        $project: {
          _id: 0,
          grupo_etario: "$_id",
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
          },
          total_historiales: 1
        }
      },
      {
        $sort: {
          grupo_etario: 1
        }
      }
    ]);

    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener signos vitales por grupo',
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
  resumenClinico
};