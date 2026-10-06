/**
 * Full-Stack Express Server
 * Serves API routes and compiled Vite static files
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { handleAskPortfolio, handleGitHubActivity } from './src/server/agent.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '4kb' }));

// API: Ask Portfolio AI Agent
app.post('/api/ask-portfolio', async (req: Request, res: Response) => {
  try {
    const { question } = req.body;
    const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const result = await handleAskPortfolio(question, clientIp);
    res.json(result);
  } catch (error) {
    console.error('Error handling ask-portfolio:', error);
    res.status(500).json({ error: 'Failed to process inquiry', answer: 'An error occurred. Please try again shortly.' });
  }
});

// API: GitHub Activity Proxy
app.get('/api/github', async (_req: Request, res: Response) => {
  try {
    const data = await handleGitHubActivity();
    res.json(data);
  } catch (error) {
    console.error('Error fetching github activity:', error);
    res.status(500).json({ error: 'Could not fetch GitHub activity' });
  }
});

// API: Portfolio service health
app.get('/api/ping', (_req: Request, res: Response) => {
  res.json({
    service: 'portfolio-api',
    status: 'online',
    timestamp: new Date().toISOString(),
  });
});

// Serve frontend static build in production
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback to index.html for SPA routing
app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
