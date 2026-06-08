// Pipelines de aggregation para MongoDB
// Coleccion: historiales_clinicos

// RC-07: Top 5 diagnosticos mas frecuentes
var fechaInicioTrimestre = new Date();
fechaInicioTrimestre.setMonth(fechaInicioTrimestre.getMonth() - 3);

const topDiagnosticos = [
  {
    $match: {
      fecha_registro: { $gte: fechaInicioTrimestre }
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
];


// RC-08: Medicamentos mas recetados por especialidad
const medicamentosPorEspecialidad = [
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
];


// RC-09: Analisis de signos vitales por grupo etario aproximado
// Como Mongo guarda paciente_id pero no fecha de nacimiento,
// se agrupa de forma simulada usando rangos segun paciente_id.
const signosVitalesPorGrupo = [
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
];


// Pipeline con $facet
// Devuelve varios reportes clinicos en una sola ejecucion.
const resumenClinicoFacet = [
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
];

// RC-10: Tiempo promedio entre consultas por paciente.
const tiempoPromedioConsultas = [
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
  }
];

module.exports = {
  topDiagnosticos,
  medicamentosPorEspecialidad,
  signosVitalesPorGrupo,
  resumenClinicoFacet,
  tiempoPromedioConsultas
};
