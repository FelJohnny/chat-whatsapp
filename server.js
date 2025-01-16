require("dotenv").config(); // Carrega as variáveis de ambiente do arquivo .env

const fs = require("fs");
const https = require("https");
const app = require("./app.js"); // Importa a aplicação Express

const PORT = process.env.PORT; // Define a porta do servidor HTTPS

// Configuração do HTTPS com os certificados SSL
const httpsOptions = {
  key: fs.readFileSync("/etc/letsencrypt/live/felipejohnny.com/privkey.pem"), // Caminho da chave privada
  cert: fs.readFileSync("/etc/letsencrypt/live/felipejohnny.com/fullchain.pem"), // Caminho do certificado
};

// Criação do servidor HTTPS
const server = https.createServer(httpsOptions, app);

// Inicia o servidor
server.listen(PORT, () => {
  console.log(`Servidor HTTPS rodando na porta ${PORT}`);
});
