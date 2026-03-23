const fs = require('fs');
const http = require('http');
const path = require('path');

const { urls } = require('../config/kanban.config');

const frontendPort = Number(process.env.FRONTEND_PORT || 4318);
const backendPort = Number(process.env.BACKEND_PORT || 4319);
const distDir = process.env.FRONTEND_DIST_DIR
  ? path.resolve(process.env.FRONTEND_DIST_DIR)
  : path.join(__dirname, '..', 'client', 'dist', 'client', 'browser');

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function proxyRequest(req, res) {
  const request = http.request(
    {
      hostname: '127.0.0.1',
      port: backendPort,
      path: req.url,
      method: req.method,
      headers: req.headers
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
      proxyRes.pipe(res);
    }
  );

  request.on('error', () => {
    sendJson(res, 502, { message: 'Backend unavailable' });
  });

  req.pipe(request);
}

function resolveAssetPath(requestPath) {
  const normalizedPath = requestPath === '/' ? '/index.html' : requestPath;
  const safePath = normalizedPath.split('?')[0].replace(/^\/+/, '');
  const absolutePath = path.resolve(distDir, safePath);

  if (!absolutePath.startsWith(distDir)) {
    return null;
  }

  return absolutePath;
}

function serveFile(filePath, res) {
  fs.readFile(filePath, (error, content) => {
    if (error) {
      sendJson(res, 500, { message: 'Unable to read frontend asset' });
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[extension] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
  if (!req.url) {
    sendJson(res, 400, { message: 'Missing URL' });
    return;
  }

  if (req.url === '/health') {
    sendJson(res, 200, {
      status: 'ok',
      frontendUrl: urls.frontend,
      backendUrl: urls.backend
    });
    return;
  }

  if (req.url.startsWith('/api/')) {
    proxyRequest(req, res);
    return;
  }

  const requestedPath = resolveAssetPath(req.url);

  if (!requestedPath) {
    sendJson(res, 403, { message: 'Forbidden path' });
    return;
  }

  fs.stat(requestedPath, (statError, stat) => {
    if (!statError && stat.isFile()) {
      serveFile(requestedPath, res);
      return;
    }

    serveFile(path.join(distDir, 'index.html'), res);
  });
});

server.listen(frontendPort, '127.0.0.1', () => {
  console.log(`Kanban frontend listening on ${urls.frontend}`);
});

function shutdown() {
  server.close(() => {
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
