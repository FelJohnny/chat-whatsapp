const express = require("express");
const router = express.Router();
const whatsappRoutes = require("./whatsappRoutes");

// Rotas específicas do WhatsApp
router.use("/whatsapp", whatsappRoutes);

module.exports = router;
