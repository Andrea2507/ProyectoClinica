const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pacientesRoutes = require('./routes/pacientes.routes');
const medicosRoutes = require('./routes/medicos.routes');
const citasRoutes = require('./routes/citas.routes');
const pagosRoutes = require('./routes/pagos.routes');
const facturasRoutes = require('./routes/facturas.routes');
const serviciosRoutes = require('./routes/servicios.routes');
const reportesRoutes = require('./routes/reportes.routes');
const historialesRoutes = require('./routes/historiales.routes');
const reportesMongoRoutes = require('./routes/reportesMongo.routes');

const conectarMongo = require('./config/mongo');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    mensaje: 'API de clínica funcionando'
  });
});

app.use('/api/pacientes', pacientesRoutes);
app.use('/api/medicos', medicosRoutes);
app.use('/api/citas', citasRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/facturas', facturasRoutes);
app.use('/api/servicios', serviciosRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/historiales', historialesRoutes);
app.use('/api/reportes-mongo', reportesMongoRoutes);

const puerto = process.env.PORT || 3000;

async function iniciarServidor() {
  try {
    await conectarMongo();

    app.listen(puerto, () => {
      console.log(`Servidor corriendo en http://localhost:${puerto}`);
    });
  } catch (error) {
    console.error('No se pudo iniciar el servidor:', error.message);
    process.exit(1);
  }
}

iniciarServidor();
