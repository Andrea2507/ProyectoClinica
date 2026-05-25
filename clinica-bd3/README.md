# clinica-bd3

Proyecto base para una API de clinica con Express + Node, PostgreSQL y MongoDB.

## Requisitos

- Node.js 18+
- PostgreSQL
- MongoDB

## Instalacion

```bash
npm install
```

## Ejecucion

```bash
npm run dev
```

La API inicia por defecto en `http://localhost:3000`.

## Endpoints base

- `GET /api/citas`
- `GET /api/pagos`
- `GET /api/reportes`
- `GET /api/historiales`
- `GET /health`

## Estructura

- `src/config`: configuracion de conexiones a bases de datos.
- `src/routes`: definicion de rutas HTTP.
- `src/controllers`: logica de entrada/salida para cada recurso.
- `src/models`: modelos de MongoDB.
- `database/postgres`: scripts SQL separados por responsabilidad.
- `database/mongo`: definicion, seed y pipelines de MongoDB.
- `backups`: scripts de respaldo y restauracion.
- `docs`: documentacion tecnica del proyecto.
