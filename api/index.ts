import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { registerRoutes } from '../server/routes';
import { setupVite, serveStatic } from '../server/vite';

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set up routes
  const server = await registerRoutes(app);
  
  // Handle the request
  return app(req, res);
}