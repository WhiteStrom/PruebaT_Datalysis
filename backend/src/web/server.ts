import '../loadEnv';
import express from 'express';
import cors from 'cors';
import type { Request, Response, NextFunction } from 'express';

import prisma from '../infra/prismaClient';
import { PrismaDashboardRepository } from '../infra/repositories/PrismaDashboardRepository';
import { GetKpisUseCase } from '../application/GetKpisUseCase';
import { GetTrendUseCase } from '../application/GetTrendUseCase';
import { GetRankingsUseCase } from '../application/GetRankingsUseCase';
import { GetFiltersUseCase } from '../application/GetFiltersUseCase';
import { DashboardController } from './controllers/DashboardController';
import { createDashboardRouter } from './routes/dashboard.routes';

const app = express();
const PORT = process.env['PORT'] ?? 3001; // Corregido el conflicto de puertos con el frontend

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env['FRONTEND_URL'] ?? '*' }));
app.use(express.json());

// ─── Dependency Injection (Composition Root) ──────────────────────────────────
const repo = new PrismaDashboardRepository(prisma);
const getKpisUseCase = new GetKpisUseCase(repo);
const getTrendUseCase = new GetTrendUseCase(repo);
const getRankingsUseCase = new GetRankingsUseCase(repo);
const getFiltersUseCase = new GetFiltersUseCase(repo);
const controller = new DashboardController(
  getKpisUseCase,
  getTrendUseCase,
  getRankingsUseCase,
  getFiltersUseCase
);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api', createDashboardRouter(controller));

// ─── Error Handler ────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ success: false, error: err.message });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});

export default app;
