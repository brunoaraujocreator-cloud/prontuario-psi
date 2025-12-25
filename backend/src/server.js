import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';

// Importação de TODAS as rotas do projeto
import authRoutes from './routes/auth.js';
import patientRoutes from './routes/patients.js';
import sessionRoutes from './routes/sessions.js';
import groupRoutes from './routes/groups.js';
import eventRoutes from './routes/events.js';
import expenseRoutes from './routes/expenses.js';
import receivableRoutes from './routes/receivables.js';
import invoiceRoutes from './routes/invoices.js';
import reportRoutes from './routes/reports.js';
import historyRoutes from './routes/history.js';
import trashRoutes from './routes/trash.js';
import settingsRoutes from './routes/settings.js';
import pdfRoutes from './routes/pdf.js';

dotenv.config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json());

// Registro de todas as rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/receivables', receivableRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/trash', trashRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/pdf', pdfRoutes);

// SERVIR FRONTEND: O Backend entrega os arquivos da pasta 'public'
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

// Rota para o SPA: Qualquer rota que não seja da API cai no index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor PSI rodando na porta ${PORT}`);
});
