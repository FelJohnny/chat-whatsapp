const express = require("express");
const routes = require("./routes/index.js"); // Importa as rotas

const app = express();

// Middlewares
app.use(express.json());

// Rotas
app.use("/", routes);

module.exports = app;
