import express, { type Express } from 'express';
import router from './routes/index.js';
import { avatarDirectory } from './controllers/avatar.controller.js';

const app: Express = express();

app.use(express.json());
app.use('/api/avatars', express.static(avatarDirectory, { index: false }));
app.use('/api', router);

export default app;
