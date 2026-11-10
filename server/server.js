import express from 'express';
import cors from 'cors';
import { db, loadDatabase } from './db.js';

import productsRouter from './routes/products.js';
import categoriesRouter from './routes/categories.js';
import salesRouter from './routes/sales.js';
import shiftsRouter from './routes/shifts.js';
import customersRouter from './routes/customers.js';
import creditsRouter from './routes/credits.js';
import suppliersRouter from './routes/suppliers.js';
import expensesRouter from './routes/expenses.js';
import deliveriesRouter from './routes/deliveries.js';
import hrRouter from './routes/hr.js';
import documentsRouter from './routes/documents.js';
import accountingRouter from './routes/accounting.js';
import auditRouter from './routes/audit.js';
import settingsRouter from './routes/settings.js';
import syncRouter from './routes/sync.js';
import copilotRouter from './routes/copilot.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging in development
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.originalUrl.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Root & Healthcheck
app.get('/api/health', (req, res) => {
  try {
    const rawData = loadDatabase();
    res.json({
      status: 'UP',
      uptime: process.uptime(),
      system: 'AURA ERP & POS - African Enterprise OS',
      version: '5.2.0-OHADA',
      timestamp: new Date().toISOString(),
      stats: {
        products: (rawData.products || []).length,
        categories: (rawData.categories || []).length,
        sales: (rawData.sales || []).length,
        customers: (rawData.customers || []).length,
        suppliers: (rawData.suppliers || []).length,
        employees: (rawData.employees || []).length,
        credits: (rawData.credits || []).length,
        deliveries: (rawData.deliveries || []).length,
        documents: (rawData.documents || []).length,
        expenses: (rawData.expenses || []).length,
        auditLogs: (rawData.auditLogs || []).length
      }
    });
  } catch (e) {
    res.status(500).json({ status: 'ERROR', error: e.message });
  }
});

// Mount Routes
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/sales', salesRouter);
app.use('/api/shifts', shiftsRouter);
app.use('/api/customers', customersRouter);
app.use('/api/credits', creditsRouter);
app.use('/api/suppliers', suppliersRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/deliveries', deliveriesRouter);
app.use('/api/hr', hrRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/accounting', accountingRouter);
app.use('/api/audit', auditRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/sync', syncRouter);
app.use('/api/copilot', copilotRouter);

// 404 handler for API routes
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, error: `Endpoint ${req.method} ${req.originalUrl} non trouvé` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(500).json({ success: false, error: err.message || 'Erreur interne du serveur' });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 AURA ERP & POS Backend Server is RUNNING on port ${PORT}`);
  console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🩺 Healthcheck:  http://localhost:${PORT}/api/health`);
  console.log(`📦 Database:     Loaded and ready with atomic JSON persistence`);
  console.log(`=======================================================`);
});

export default app;
