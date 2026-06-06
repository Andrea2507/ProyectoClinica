
## Escenario seleccionado

**Opción A: Clínica médica privada**

El sistema permite manejar pacientes, médicos, especialidades, citas, facturación, pagos, auditoría e historiales clínicos.

PostgreSQL se utiliza para los datos que necesitan integridad, relaciones y transacciones, como citas, facturas, pagos y auditoría.

MongoDB se utiliza para los historiales clínicos, ya que su estructura puede variar según la especialidad médica y el caso clínico.

---

## Tecnologías utilizadas

- Node.js
- Express
- PostgreSQL
- MongoDB
- pg
- Mongoose
- dotenv
- cors
- nodemon

---

## Estructura general del proyecto

```txt
clinica-bd3/
│
├── database/
│   ├── postgres/
│   │   ├── 01_schema.sql
│   │   ├── 02_views.sql
│   │   ├── 03_materialized_views.sql
│   │   ├── 04_functions.sql
│   │   ├── 05_procedures.sql
│   │   ├── 06_indexes.sql
│   │   └── 07_seed.sql
│   │
│   └── mongo/
│       ├── collections.md
│       ├── pipelines.js
│       └── seed.js
│
├── docs/
│   ├── decisiones_diseno.md
│   ├── bitacora_ia.md
│   ├── reporte_performance.md
│   └── estrategia_respaldo.md
│
├── src/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── app.js
│
├── backups/
├── .env.example
├── package.json
└── README.md