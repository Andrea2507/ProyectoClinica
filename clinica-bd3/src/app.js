require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { testPostgresConnection } = require("./config/postgres");
const { connectMongo } = require("./config/mongo");

const citasRoutes = require("./routes/citas.routes");
const pagosRoutes = require("./routes/pagos.routes");
const reportesRoutes = require("./routes/reportes.routes");
const historialesRoutes = require("./routes/historiales.routes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "clinica-bd3",
  });
});

app.use("/api/citas", citasRoutes);
app.use("/api/pagos", pagosRoutes);
app.use("/api/reportes", reportesRoutes);
app.use("/api/historiales", historialesRoutes);

async function startServer() {
  await testPostgresConnection();
  await connectMongo();

  app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("No se pudo iniciar el servidor:", error);
  process.exit(1);
});

module.exports = app;
