const express = require("express");
const bodyParser = require("body-parser");
const routes = require("./routes/index.js"); // Importa as rotas

const app = express();

// Middlewares
app.use(bodyParser.json());

// Rotas
app.use("/", routes);

module.exports = app;
