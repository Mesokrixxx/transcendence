import { createServer } from 'node:https';
import { readFileSync } from 'node:fs';
import app from './app.js';
import { attachWebSocket } from './websocket.js';

const options = {
  key: readFileSync('./certs/private-key.pem'),
  cert: readFileSync('./certs/certificate.pem'),
};

const server = createServer(options, app);

attachWebSocket(server);

const port = 8080;
server.listen(port, '0.0.0.0', () => {
	console.log(`Backend is listening on port ${port}`);
});
