import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

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

// Initialize Supabase
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
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

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Serve static files from frontend in production
if (process.env.NODE_ENV === 'production') {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const frontendPath = path.join(__dirname, '../../frontend/dist');
  
  app.use(express.static(frontendPath));
  
  // Serve index.html for all non-API routes (SPA routing)
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(frontendPath, 'index.html'));
    } else {
      res.status(404).json({ error: 'Route not found' });
    }
  });
} else {
  // 404 handler for development
  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});



