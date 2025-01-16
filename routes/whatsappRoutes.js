const express = require("express");
const router = express.Router();
const whatsappController = require("../controllers/whatsappController");

// Rota para enviar mensagem de texto simples
router.post("/send-text", whatsappController.sendTextMessage);

// Rota para enviar mensagem com botões
router.post("/send-buttons", whatsappController.sendMessageWithButtons);

// Rota para enviar mensagem com botões de share
router.post("/send-buttons-share", whatsappController.sendPersonalizedButtons);

// Rota para enviar mensagem com template hello_world
router.post("/send-template", whatsappController.sendTemplateMessage);

// Rota para o webhook
router.post("/webhook", whatsappController.webhook);

// Rota para verificação do webhook
router.get("/webhook", whatsappController.verifyWebhook);

module.exports = router;
