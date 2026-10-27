import { createServer } from 'node:http';
import app from './app.js';
import { attachWebSocket } from './websocket.js';

const port = 8080;
const server = createServer(app);

attachWebSocket(server);

server.listen(port, '0.0.0.0', () => {
	console.log(`Backend is listening on port ${port}`);
});
