const path = require('path');
const mongoose = require('mongoose');

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

async function conectarMongo() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB conectado correctamente');
  } catch (error) {
    console.error('Error al conectar MongoDB:', error.message);
  }
}

module.exports = conectarMongo;