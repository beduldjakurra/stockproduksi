// server.ts - Next.js Standalone + Socket.IO
import { setupSocket } from '@/lib/socket';
import { createServer } from 'http';
import { Server } from 'socket.io';
import next from 'next';
import fs from 'fs';
import path from 'path';

const dev = process.env.NODE_ENV !== 'production';
const currentPort = 3000;
const hostname = '0.0.0.0';

// Custom server with Socket.IO integration
async function createCustomServer() {
  try {
    // Create Next.js app with proper configuration
    const nextApp = next({ 
      dev,
      dir: process.cwd(),
      hostname,
      port: currentPort
    });

    await nextApp.prepare();
    const handle = nextApp.getRequestHandler();

    // Create HTTP server that will handle both Next.js and Socket.IO
    const server = createServer(async (req, res) => {
      // Skip socket.io requests from Next.js handler
      if (req.url?.startsWith('/api/socketio')) {
        return;
      }
      
      // Handle PWA index.html directly from public folder
      if (req.url === '/index.html' || req.url === '/app') {
        try {
          const filePath = path.join(process.cwd(), 'public', 'index.html');
          if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            res.statusCode = 200;
            res.end(content);
            return;
          }
        } catch (error) {
          console.error('Error serving index.html:', error);
        }
      }
      
      // Handle manifest.json
      if (req.url === '/manifest.json') {
        try {
          const filePath = path.join(process.cwd(), 'public', 'manifest.json');
          if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            res.setHeader('Content-Type', 'application/manifest+json');
            res.statusCode = 200;
            res.end(content);
            return;
          }
        } catch (error) {
          console.error('Error serving manifest.json:', error);
        }
      }
      
      // Handle Next.js requests
      try {
        await handle(req, res);
      } catch (error) {
        console.error('Request handling error:', error);
        if (!res.headersSent) {
          res.statusCode = 500;
          res.end('Internal Server Error');
        }
      }
    });

    // Setup Socket.IO
    const io = new Server(server, {
      path: '/api/socketio',
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    setupSocket(io);

    // Start the server
    server.listen(currentPort, hostname, () => {
      console.log(`> Ready on http://${hostname}:${currentPort}`);
      console.log(`> Socket.IO server running at ws://${hostname}:${currentPort}/api/socketio`);
    });

    // Handle server errors
    server.on('error', (error) => {
      console.error('Server error:', error);
    });

  } catch (err) {
    console.error('Server startup error:', err);
    process.exit(1);
  }
}

// Start the server
createCustomServer();
