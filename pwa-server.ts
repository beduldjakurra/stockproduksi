// pwa-server.ts - Simple HTTP server for PWA
import { createServer } from 'http';
import fs from 'fs';
import path from 'path';
import { URL } from 'url';

const PORT = 3001;
const PUBLIC_DIR = path.join(process.cwd(), 'public');

// MIME types
const mimeTypes: { [key: string]: string } = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = createServer((req, res) => {
  console.log(`📥 Request: ${req.method} ${req.url}`);
  
  try {
    let filePath = '';
    
    // Handle root request - serve index.html
    if (req.url === '/' || req.url === '/app') {
      filePath = path.join(PUBLIC_DIR, 'index.html');
    } else {
      // Parse URL and get pathname
      const parsedUrl = new URL(req.url!, `http://localhost:${PORT}`);
      filePath = path.join(PUBLIC_DIR, parsedUrl.pathname);
    }
    
    // Security check - ensure file is within public directory
    const resolvedPath = path.resolve(filePath);
    const resolvedPublicDir = path.resolve(PUBLIC_DIR);
    
    if (!resolvedPath.startsWith(resolvedPublicDir)) {
      res.statusCode = 403;
      res.end('Forbidden');
      return;
    }
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${filePath}`);
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/html');
      res.end('<h1>404 - File Not Found</h1>');
      return;
    }
    
    // Get file stats
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      // If directory, try to serve index.html
      const indexPath = path.join(filePath, 'index.html');
      if (fs.existsSync(indexPath)) {
        filePath = indexPath;
      } else {
        res.statusCode = 404;
        res.end('Directory listing not allowed');
        return;
      }
    }
    
    // Determine content type
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    
    // Set headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Read and serve file
    const fileContent = fs.readFileSync(filePath);
    res.statusCode = 200;
    res.end(fileContent);
    
    console.log(`✅ Served: ${filePath} (${contentType})`);
    
  } catch (error) {
    console.error('❌ Server error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/html');
    res.end('<h1>500 - Internal Server Error</h1>');
  }
});

server.listen(PORT, () => {
  console.log(`🚀 PWA Server running at http://localhost:${PORT}`);
  console.log(`📁 Serving files from: ${PUBLIC_DIR}`);
  console.log(`🎯 Access PWA at: http://localhost:${PORT}/`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('🔥 Server error:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down PWA server...');
  server.close(() => {
    console.log('✅ PWA Server stopped');
    process.exit(0);
  });
});