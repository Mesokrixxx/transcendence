import express, { type Express } from 'express';
import router from './routes/index.js';

const app: Express = express();

app.use(express.json());
app.use('/api', router);

export default app;
