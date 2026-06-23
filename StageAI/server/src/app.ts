import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import generateRoutes from './routes/generate.routes';

import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

// Middlewares
app.use(cors({
    origin: ['http://localhost:3006', 'http://127.0.0.1:3006'],
    credentials: true
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api', generateRoutes);

// Health Check
app.get('/', (req, res) => {
    res.send('VirtuStage AI Server is Running 🚀');
});

export default app;
