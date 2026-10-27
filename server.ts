/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Full-Stack Server Entry Point (Express + Vite Middlewares + Cloud SQL PostgreSQL)
 * Runs on Port 3000
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { requireAuth, optionalAuth, AuthRequest } from './src/middleware/auth.ts';
import {
  seedInitialDataIfEmpty,
  getIncidents,
  insertIncident,
  getResources,
  updateResourceStatus,
  getShelters,
  getAgentLogs,
  recordAgentLog,
  getOrCreateUser,
} from './src/db/repository.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // Asynchronously seed initial data if needed without blocking startup
  seedInitialDataIfEmpty().catch(err => {
    console.warn('Initial database seed check failed (database may be initializing):', err.message);
  });

  // REST API Routes
  app.get('/api/health', async (_req, res) => {
    res.json({
      status: 'ONLINE',
      database: 'Cloud SQL PostgreSQL (Developer Edition)',
      region: 'asia-south1',
      timestamp: new Date().toISOString(),
    });
  });

  // User Profile Sync (Authenticated via Firebase Bearer Token)
  app.post('/api/auth/sync', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User token required' });
      }
      const user = await getOrCreateUser(req.user.uid, req.user.email || 'commander@suraksha.gov.in', req.user.name);
      res.json({ success: true, user });
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error in /api/auth/sync:', err);
      res.status(500).json({ error: err.message || 'Database user sync failed' });
    }
  });

  // Incidents
  app.get('/api/incidents', async (_req, res) => {
    try {
      const allIncidents = await getIncidents();
      res.json(allIncidents);
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({ error: err.message || 'Failed to fetch incidents' });
    }
  });

  app.post('/api/incidents', optionalAuth, async (req, res) => {
    try {
      const created = await insertIncident(req.body);
      res.status(201).json(created);
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({ error: err.message || 'Failed to insert incident' });
    }
  });

  // Resources
  app.get('/api/resources', async (_req, res) => {
    try {
      const allResources = await getResources();
      res.json(allResources);
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({ error: err.message || 'Failed to fetch resources' });
    }
  });

  app.patch('/api/resources/:id', optionalAuth, async (req, res) => {
    try {
      const { status, currentIncidentId } = req.body;
      const updated = await updateResourceStatus(req.params.id, status, currentIncidentId);
      res.json(updated);
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({ error: err.message || 'Failed to update resource' });
    }
  });

  // Shelters
  app.get('/api/shelters', async (_req, res) => {
    try {
      const allShelters = await getShelters();
      res.json(allShelters);
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({ error: err.message || 'Failed to fetch shelters' });
    }
  });

  // Agent Logs
  app.get('/api/agent-logs', async (_req, res) => {
    try {
      const logs = await getAgentLogs();
      res.json(logs);
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({ error: err.message || 'Failed to fetch agent logs' });
    }
  });

  app.post('/api/agent-logs', async (req, res) => {
    try {
      await recordAgentLog(req.body);
      res.status(201).json({ success: true });
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({ error: err.message || 'Failed to record agent log' });
    }
  });

  // Vite Integration (Dev Middleware vs Production Static Serving)
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Suraksha Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
