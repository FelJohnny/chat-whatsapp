const https = require("https");
require("dotenv").config();

const ACCESS_TOKEN = process.env.ACCESS_TOKEN || "SEU_ACCESS_TOKEN_AQUI";
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "SEU_VERIFY_TOKEN_AQUI";
const API_URL = process.env.API_URL;

// Função genérica para enviar requisições HTTPS
const sendHttpsRequest = (url, method, data, headers) => {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);

    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method,
      headers,
    };

    const req = https.request(options, (res) => {
      let responseData = "";

      res.on("data", (chunk) => {
        responseData += chunk;
      });

      res.on("end", () => {
        try {
          resolve(JSON.parse(responseData));
        } catch (err) {
          reject(new Error("Erro ao parsear a resposta: " + err.message));
        }
      });
    });

    req.on("error", (err) => {
      reject(new Error("Erro na requisição: " + err.message));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
};

exports.replyMessage = async (to, type, message) => {
  if ((!to || !message, type)) {
    return res.status(400).json({
      error: 'Os campos "to" e "message" são obrigatórios.',
    });
  }
  try {
    const data = {
      messaging_product: "whatsapp",
      to,
      type: type,
      text: { body: message },
    };

    const headers = {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    };

    const response = await sendHttpsRequest(API_URL, "POST", data, headers);
    console.log({
      message: "Mensagem de texto respondida com sucesso!",
      data: response,
    });
  } catch (error) {
    console.error("Erro ao enviar mensagem de texto:", error.message);
  }
};

// **1. Enviar mensagens de texto simples**
exports.sendTextMessage = async (req, res) => {
  const { to, message } = req.body;

  if (!to || !message) {
    return res.status(400).json({
      error: 'Os campos "to" e "message" são obrigatórios.',
    });
  }

  try {
    const data = {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: message },
    };

    const headers = {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    };

    const response = await sendHttpsRequest(API_URL, "POST", data, headers);

    res.status(200).json({
      message: "Mensagem de texto enviada com sucesso!",
      data: response,
    });
  } catch (error) {
    console.error("Erro ao enviar mensagem de texto:", error.message);
    res.status(500).json({
      error: "Erro ao enviar a mensagem de texto.",
      details: error.message,
    });
  }
};

// **2. Enviar mensagens com botões**
exports.sendMessageWithButtons = async (req, res) => {
  const { to } = req.body;

  if (!to) {
    return res.status(400).json({
      error: 'O campo "to" é obrigatório.',
    });
  }

  try {
    const data = {
      messaging_product: "whatsapp",
      to,
      type: "interactive",
      interactive: {
        type: "button",
        body: {
          text: "Você gostaria de continuar? Escolha uma opção:",
        },
        action: {
          buttons: [
            {
              type: "reply",
              reply: {
                id: "yes_option",
                title: "Sim",
              },
            },
            {
              type: "reply",
              reply: {
                id: "no_option",
                title: "Não",
              },
            },
          ],
        },
      },
    };

    const headers = {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    };

    const response = await sendHttpsRequest(API_URL, "POST", data, headers);

    res.status(200).json({
      message: "Mensagem com botões enviada com sucesso!",
      data: response,
    });
  } catch (error) {
    console.error("Erro ao enviar mensagem com botões:", error.message);
    res.status(500).json({
      error: "Erro ao enviar a mensagem com botões.",
      details: error.message,
    });
  }
};

// **3. Enviar mensagens com template**
exports.sendTemplateMessage = async (req, res) => {
  const { to } = req.body;

  if (!to) {
    return res.status(400).json({
      error: 'O campo "to" é obrigatório.',
    });
  }

  try {
    const data = {
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: "hello_world",
        language: { code: "en_US" },
      },
    };

    const headers = {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    };

    const response = await sendHttpsRequest(API_URL, "POST", data, headers);

    res.status(200).json({
      message: 'Template "Hello World" enviado com sucesso!',
      data: response,
    });
  } catch (error) {
    console.error('Erro ao enviar template "Hello World":', error.message);
    res.status(500).json({
      error: 'Erro ao enviar o template "Hello World".',
      details: error.message,
    });
  }
};

// Webhook para lidar com mensagens recebidas
exports.webhook = (req, res) => {
  try {
    const body = req.body;

    if (body.object === "whatsapp_business_account") {
      body.entry.forEach((entry) => {
        entry.changes.forEach((change) => {
          if (change.field === "messages") {
            const messages = change.value.messages || [];

            messages.forEach((message) => {
              const from = message.from || "número não identificado";
              const messageId = message.id || "id não identificado";
              const messageType = message.type || "tipo não identificado";

              // Lida com mensagens de texto
              if (messageType === "text" && message.text) {
                const messageBody = message.text.body || "mensagem vazia";
                console.log(
                  `Mensagem de texto recebida de ${from}: ${messageBody}`
                );
                //reponde mensagem
                replyMessage("5511951170016", messageType, "ola tudo bem?");
              }
              // Lida com respostas de botões
              else if (messageType === "interactive" && message.interactive) {
                const buttonReply = message.interactive.button_reply || {};
                const replyId = buttonReply.id || "null";
                const replyTitle = buttonReply.title || "null";

                console.log(
                  `Resposta de botão recebida de ${from}: ID=${replyId}, Título=${replyTitle}`
                );
                //reponde mensagem
                replyMessage("5511951170016", messageType, "ola tudo bem?");
              } else {
                console.log(`Tipo de mensagem não tratado: ${messageType}`);
              }
            });
          }
        });
      });
    }

    res.sendStatus(200); // Confirma o recebimento
  } catch (error) {
    console.error("Erro ao processar webhook:", error.message);
    res.sendStatus(500);
  }
};

// **5. Verificação do webhook**
exports.verifyWebhook = (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verificado com sucesso.");
    res.status(200).send(challenge);
  } else {
    console.error("Falha na verificação do webhook.");
    res.status(403).send("Falha na verificação do webhook.");
  }
};
