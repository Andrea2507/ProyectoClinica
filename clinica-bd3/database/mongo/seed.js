var database = db.getSiblingDB("clinica");

var especialidades = [
  "Medicina General",
  "Pediatria",
  "Cardiologia",
  "Dermatologia",
  "Ginecologia"
];

var motivos = [
  "Dolor de cabeza frecuente",
  "Control general",
  "Dolor abdominal",
  "Revision de rutina",
  "Seguimiento medico",
  "Molestia respiratoria",
  "Dolor en el pecho",
  "Consulta por alergia",
  "Control pediatrico",
  "Chequeo preventivo"
];

var diagnosticosBase = [
  "Cefalea tensional",
  "Infeccion respiratoria leve",
  "Gastritis",
  "Hipertension arterial",
  "Dermatitis alergica",
  "Control sin hallazgos graves",
  "Rinitis alergica",
  "Dolor muscular",
  "Anemia leve",
  "Ansiedad"
];

var medicamentosBase = [
  "Paracetamol",
  "Ibuprofeno",
  "Loratadina",
  "Omeprazol",
  "Amoxicilina",
  "Losartan",
  "Suero oral",
  "Salbutamol",
  "Metformina",
  "Vitamina C"
];

var examenesBase = [
  "Hemograma",
  "Glucosa",
  "Radiografia",
  "Examen general de orina",
  "Perfil lipidico",
  "Electrocardiograma",
  "Ultrasonido",
  "Prueba de alergias"
];

function elegir(lista, indice) {
  return lista[indice % lista.length];
}

function crearDatosEspecialidad(especialidad, i) {
  if (especialidad === "Cardiologia") {
    return {
      antecedentes_cardiacos: i % 2 === 0,
      dolor_pecho: i % 3 === 0,
      electrocardiograma_solicitado: i % 4 === 0,
      observacion: "Evaluacion cardiovascular general"
    };
  }

  if (especialidad === "Dermatologia") {
    return {
      zona_afectada: elegir(["rostro", "brazos", "piernas", "espalda"], i),
      tipo_lesion: elegir(["mancha", "irritacion", "roncha", "resequedad"], i),
      tiempo_evolucion_dias: (i % 20) + 1,
      observacion: "Evaluacion dermatologica general"
    };
  }

  if (especialidad === "Pediatria") {
    return {
      vacunas_al_dia: i % 2 === 0,
      peso_percentil: elegir(["P25", "P50", "P75"], i),
      desarrollo_adecuado: true,
      observacion: "Control pediatrico general"
    };
  }

  if (especialidad === "Ginecologia") {
    return {
      control_rutina: i % 2 === 0,
      examen_mama: i % 3 === 0,
      observacion: "Evaluacion ginecologica general"
    };
  }

  return {
    observacion_general: "Consulta general sin datos especificos adicionales"
  };
}

var historiales = [];

for (var i = 1; i <= 150; i++) {
  var especialidad = elegir(especialidades, i);
  var diagnostico = elegir(diagnosticosBase, i);
  var medicamento = elegir(medicamentosBase, i);

  historiales.push({
    cita_id: i,
    paciente_id: ((i - 1) % 30) + 1,
    medico_id: ((i - 1) % 10) + 1,
    especialidad: especialidad,
    motivo_consulta: elegir(motivos, i),

    signos_vitales: {
      presion_arterial: (110 + (i % 30)) + "/" + (70 + (i % 15)),
      frecuencia_cardiaca: 65 + (i % 35),
      temperatura: 36 + ((i % 15) / 10),
      peso: 45 + (i % 50),
      altura: 1.45 + ((i % 40) / 100),
      saturacion_oxigeno: 94 + (i % 6)
    },

    diagnosticos: [
      {
        codigo: "DX-" + String(i).padStart(3, "0"),
        descripcion: diagnostico,
        tipo: "principal"
      }
    ],

    medicamentos: [
      {
        nombre: medicamento,
        dosis: elegir(["500 mg", "250 mg", "10 mg", "5 ml"], i),
        frecuencia: elegir(["cada 8 horas", "cada 12 horas", "una vez al dia"], i),
        duracion: elegir(["3 dias", "5 dias", "7 dias", "10 dias"], i),
        indicaciones: "Tomar segun indicacion medica"
      }
    ],

    examenes_solicitados: [
      {
        nombre: elegir(examenesBase, i),
        descripcion: "Examen solicitado como parte de la evaluacion",
        prioridad: i % 10 === 0 ? "urgente" : "normal"
      }
    ],

    notas_adicionales: "Historial generado como dato de prueba para el proyecto.",
    datos_especialidad: crearDatosEspecialidad(especialidad, i),
    registrado_por: ((i - 1) % 3) + 1,
    fecha_registro: new Date(2026, i % 6, (i % 28) + 1)
  });
}

database.historiales_clinicos.deleteMany({});
database.historiales_clinicos.insertMany(historiales);

database.historiales_clinicos.createIndex({ paciente_id: 1 });
database.historiales_clinicos.createIndex({ medico_id: 1 });
database.historiales_clinicos.createIndex({ especialidad: 1 });
database.historiales_clinicos.createIndex({ fecha_registro: -1 });
database.historiales_clinicos.createIndex({ cita_id: 1 }, { unique: true });

print("Seed de MongoDB ejecutado correctamente");
print("Historiales insertados: " + database.historiales_clinicos.countDocuments());