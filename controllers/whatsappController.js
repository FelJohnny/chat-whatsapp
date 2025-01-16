const https = require("https");
require("dotenv").config();

const ACCESS_TOKEN = process.env.ACCESS_TOKEN || "SEU_ACCESS_TOKEN_AQUI";
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "SEU_VERIFY_TOKEN_AQUI";
const API_URL = process.env.API_URL;

// Função para enviar requisições HTTPS
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

exports.sendTextMessage = async (req, res) => {
  const { to, message } = req.body;
  console.log(ACCESS_TOKEN);
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

// Controlador para responder o webhook
exports.webhook = (req, res) => {
  try {
    const body = req.body;

    // Verifica se o webhook é de um evento do WhatsApp Business API
    if (body.object === "whatsapp_business_account") {
      body.entry.forEach((entry) => {
        // Itera sobre as alterações (changes)
        entry.changes.forEach((change) => {
          if (change.field === "messages") {
            // Obtém a mensagem recebida
            const messages = change.value.messages;
            const contacts = change.value.contacts;

            messages.forEach((message) => {
              console.log("Mensagem recebida:", message);

              // Exemplo: Responder automaticamente
              if (message.type === "text") {
                const userMessage = message.text.body;
                const from = message.from; // Número do usuário que enviou a mensagem

                console.log(`Mensagem recebida de ${from}: ${userMessage}`);

                // Chame aqui uma função para responder a mensagem
                // sendWhatsAppMessage(from, "Recebemos sua mensagem!");
              }
            });
          }
        });
      });
    }

    // Responde com 200 OK para confirmar o recebimento
    res.sendStatus(200);
  } catch (error) {
    console.error("Erro ao processar webhook:", error.message);
    res.sendStatus(500);
  }
};

// Controlador para verificação do webhook
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
