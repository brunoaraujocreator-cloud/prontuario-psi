import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/auth.js';
import patientsRoutes from './routes/patients.js';
import sessionsRoutes from './routes/sessions.js';
import expensesRoutes from './routes/expenses.js';
import receivablesRoutes from './routes/receivables.js';
import invoicesRoutes from './routes/invoices.js';
import reportsRoutes from './routes/reports.js';
import pdfRoutes from './routes/pdf.js';
import eventsRoutes from './routes/events.js';
import groupsRoutes from './routes/groups.js';
import historyRoutes from './routes/history.js';
import trashRoutes from './routes/trash.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configuração de CORS aberta
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/receivables', receivablesRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/generate-pdf', pdfRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/trash', trashRoutes);

// SERVIR FRONTEND
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = path.join(__dirname, '../public');

app.use(express.static(publicPath));

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(publicPath, 'index.html'));
  } else {
    res.status(404).json({ error: 'API não encontrada' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor PSI rodando na porta ${PORT}`);
});
