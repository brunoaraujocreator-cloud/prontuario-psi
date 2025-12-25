import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/auth.js';
import patientsRoutes from './routes/patients.js';
import sessionsRoutes from './routes/sessions.js';
import groupsRoutes from './routes/groups.js';
import eventsRoutes from './routes/events.js';
import expensesRoutes from './routes/expenses.js';
import receivablesRoutes from './routes/receivables.js';
import invoicesRoutes from './routes/invoices.js';
import reportsRoutes from './routes/reports.js';
import historyRoutes from './routes/history.js';
import trashRoutes from './routes/trash.js';
import settingsRoutes from './routes/settings.js';
import pdfRoutes from './routes/pdf.js';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/receivables', receivablesRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/trash', trashRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/pdf', pdfRoutes);

// SERVIR FRONTEND
const distPath = path.resolve(__dirname, '../../frontend/dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(distPath, 'index.html'));
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
