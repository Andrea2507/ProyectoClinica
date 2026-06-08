# Clinica BD3

Sistema para gestion de una clinica medica privada. El proyecto usa una API REST con Express, PostgreSQL para datos relacionales y transaccionales, MongoDB para historiales clinicos flexibles, y un frontend React/Vite para consumir la API.

## Tecnologias

- Node.js y npm
- Express
- PostgreSQL
- MongoDB o MongoDB Atlas
- React + Vite
- `pg`, `mongoose`, `dotenv`, `cors`

## Estructura del proyecto

```txt
clinica-bd3/
|-- database/
|   |-- postgres/
|   |   |-- 01_schema.sql
|   |   |-- 02_views.sql
|   |   |-- 03_materialized_views.sql
|   |   |-- 04_functions.sql
|   |   |-- 05_procedures.sql
|   |   |-- 06_indexes.sql
|   |   |-- 07_seed.sql
|   |   `-- 08_seed_masivo.sql
|   `-- mongo/
|       |-- collections.md
|       |-- pipelines.js
|       `-- seed.js
|-- src/
|   |-- config/
|   |-- controllers/
|   |-- models/
|   |-- routes/
|   |-- utils/
|   `-- app.js
|-- frontend/
|-- backups/
|-- docs/
|-- .env.example
|-- package.json
`-- README.md
```

## Requisitos previos

Instalar:

- Node.js 18 o superior
- npm
- PostgreSQL 14 o superior
- MongoDB local o una cuenta/cluster de MongoDB Atlas
- `psql` disponible en terminal
- `mongosh` disponible en terminal

Verificacion rapida:

```bash
node --version
npm --version
psql --version
mongosh --version
```

## 1. Clonar o abrir el proyecto

Entrar a la carpeta raiz del proyecto:

```bash
cd clinica-bd3
```

## 2. Instalar dependencias de la API

Desde la raiz:

```bash
npm install
```

## 3. Configurar variables de entorno

Copiar el archivo de ejemplo:

```bash
copy .env.example .env
```

En Linux/macOS:

```bash
cp .env.example .env
```

Editar `.env` con las credenciales reales:

```env
PORT=3000

POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DATABASE=clinica
POSTGRES_USER=postgres
POSTGRES_PASSWORD=tu_password

MONGO_URI=mongodb://localhost:27017/clinica
```

Si se usa MongoDB Atlas, `MONGO_URI` debe ser la cadena de conexion del cluster, por ejemplo:

```env
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/clinica
```

La API no termina de iniciar si MongoDB no esta disponible, porque `src/app.js` conecta a Mongo antes de abrir el servidor.

## 4. Crear la base de datos PostgreSQL

Crear la base `clinica`:

```bash
psql -U postgres -d postgres -c "CREATE DATABASE clinica;"
```

Si la base ya existe y se quiere reiniciar desde cero:

```bash
psql -U postgres -d postgres -c "DROP DATABASE IF EXISTS clinica;"
psql -U postgres -d postgres -c "CREATE DATABASE clinica;"
```

## 5. Ejecutar scripts PostgreSQL

Ejecutar los scripts en este orden:

```bash
psql -U postgres -d clinica -f database/postgres/01_schema.sql
psql -U postgres -d clinica -f database/postgres/02_views.sql
psql -U postgres -d clinica -f database/postgres/03_materialized_views.sql
psql -U postgres -d clinica -f database/postgres/04_functions.sql
psql -U postgres -d clinica -f database/postgres/05_procedures.sql
psql -U postgres -d clinica -f database/postgres/06_indexes.sql
```

Luego cargar datos de prueba. Para una carga pequena:

```bash
psql -U postgres -d clinica -f database/postgres/07_seed.sql
```

Para una carga mas grande, util para pruebas de reportes y rendimiento:

```bash
psql -U postgres -d clinica -f database/postgres/08_seed_masivo.sql
```

Nota: `07_seed.sql` y `08_seed_masivo.sql` hacen `TRUNCATE` de las tablas y reinician identidades. Usar uno u otro segun el escenario de prueba.

## 6. Ejecutar datos de prueba en MongoDB

Con MongoDB local:

```bash
mongosh "mongodb://localhost:27017" database/mongo/seed.js
```

Con MongoDB Atlas:

```bash
mongosh "mongodb+srv://usuario:password@cluster.mongodb.net/clinica" database/mongo/seed.js
```

El script crea/usa la base `clinica`, limpia la coleccion `historiales_clinicos`, inserta 150 historiales y crea indices para consultas por paciente, medico, especialidad, fecha y cita.

## 7. Levantar la API

Modo desarrollo:

```bash
npm run dev
```

Modo normal:

```bash
npm start
```

La API queda disponible en:

```txt
http://localhost:3000
```

Prueba rapida:

```bash
curl http://localhost:3000/
```

Respuesta esperada:

```json
{
  "mensaje": "API de clinica funcionando"
}
```

## 8. Endpoints principales

- `GET /api/pacientes`
- `POST /api/pacientes`
- `GET /api/medicos`
- `POST /api/medicos`
- `GET /api/medicos/especialidades`
- `GET /api/citas`
- `POST /api/citas`
- `PATCH /api/citas/:id/estado`
- `POST /api/citas/:id/cancelar`
- `GET /api/servicios`
- `GET /api/facturas`
- `POST /api/facturas`
- `GET /api/pagos`
- `GET /api/pagos/:id`
- `POST /api/pagos`
- `GET /api/historiales`
- `POST /api/historiales`
- `GET /api/historiales/paciente/:pacienteId`
- `GET /api/reportes/agenda-diaria`
- `GET /api/reportes/facturas-pendientes`
- `GET /api/reportes/facturacion-mensual`
- `GET /api/reportes/ranking-medicos`
- `GET /api/reportes/saldo-paciente/:pacienteId`
- `GET /api/reportes/disponibilidad-medico`
- `GET /api/reportes-mongo/top-diagnosticos`
- `GET /api/reportes-mongo/medicamentos-especialidad`
- `GET /api/reportes-mongo/signos-vitales`
- `GET /api/reportes-mongo/tiempo-promedio-consultas`
- `GET /api/reportes-mongo/resumen-clinico`

## 9. Levantar el frontend

El frontend esta en `frontend/` y consume la API en `http://localhost:3000`.

Instalar dependencias:

```bash
cd frontend
npm install
```

Ejecutar Vite:

```bash
npm run dev
```

Vite mostrara una URL local, normalmente:

```txt
http://localhost:5173
```

Para generar build de produccion:

```bash
npm run build
```

## 10. Orden recomendado para levantar todo desde cero

1. Instalar PostgreSQL, MongoDB/mongosh, Node.js y npm.
2. Instalar dependencias de la API con `npm install`.
3. Crear `.env` a partir de `.env.example`.
4. Crear la base PostgreSQL `clinica`.
5. Ejecutar scripts `01_schema.sql` a `06_indexes.sql`.
6. Ejecutar `07_seed.sql` o `08_seed_masivo.sql`.
7. Ejecutar `database/mongo/seed.js` con `mongosh`.
8. Levantar la API con `npm run dev`.
9. Instalar dependencias del frontend con `npm install` dentro de `frontend/`.
10. Levantar el frontend con `npm run dev` dentro de `frontend/`.

## 11. Comprobaciones utiles

Validar datos PostgreSQL:

```bash
psql -U postgres -d clinica -c "SELECT COUNT(*) FROM pacientes;"
psql -U postgres -d clinica -c "SELECT COUNT(*) FROM citas;"
```

Validar datos MongoDB:

```bash
mongosh "mongodb://localhost:27017/clinica" --eval "db.historiales_clinicos.countDocuments()"
```

Validar API:

```bash
curl http://localhost:3000/api/pacientes
curl http://localhost:3000/api/medicos
curl http://localhost:3000/api/reportes/facturas-pendientes
curl http://localhost:3000/api/reportes-mongo/top-diagnosticos
```

## 12. Respaldos y restauracion

La carpeta `backups/` contiene scripts y documentacion para respaldos:

- `backup_full.ps1`: respaldo completo de PostgreSQL.
- `backup_incremental_wal.ps1`: respaldo incremental/WAL.
- `restore.ps1`: restauracion desde respaldo.
- `wal_archiving_config.md`: guia de configuracion de archivado WAL.

Tambien hay documentacion relacionada en `docs/respaldo.md`.

## 13. Documentacion complementaria

- `docs/decisiones_diseno.md`: decisiones tecnicas y de modelado.
- `docs/bitacora_ia.md`: bitacora de uso de IA.
- `docs/reporte_performance.md`: pruebas y analisis de rendimiento.
- `docs/respaldo.md`: estrategia de respaldo.
- `database/mongo/collections.md`: descripcion de colecciones MongoDB.
- `database/mongo/pipelines.js`: consultas y agregaciones MongoDB.

## Problemas comunes

Si la API no inicia y muestra error de MongoDB, revisar que `MONGO_URI` sea correcto y que el servidor/cluster acepte conexiones.

Si PostgreSQL rechaza la conexion, revisar usuario, password, puerto y nombre de base en `.env`.

Si `psql` o `mongosh` no se reconocen como comandos, agregar sus carpetas `bin` al `PATH` del sistema.

Si el frontend no carga datos, confirmar que la API este corriendo en `http://localhost:3000`.
