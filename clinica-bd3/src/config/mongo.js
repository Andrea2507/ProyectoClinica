const mongoose = require("mongoose");

async function connectMongo() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGO_URI no esta configurada");
  }

  await mongoose.connect(uri);
  console.log("MongoDB conectado");
}

module.exports = {
  connectMongo,
};
