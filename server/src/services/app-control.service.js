const http = require('http');

const { env } = require('../config/env');

function callParentControl(pathname, options = {}) {
  const controlUrl = new URL(pathname, `${env.parentControlUrl}/`);
  const body =
    options.body === undefined
      ? null
      : typeof options.body === 'string'
        ? options.body
        : JSON.stringify(options.body);

  const headers = {
    'x-kanban-control-secret': env.controlSecret,
    ...(options.headers || {})
  };

  if (body !== null) {
    headers['Content-Type'] = 'application/json; charset=utf-8';
    headers['Content-Length'] = Buffer.byteLength(body);
  }

  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: controlUrl.hostname,
        port: Number(controlUrl.port),
        path: `${controlUrl.pathname}${controlUrl.search}`,
        method: options.method || 'GET',
        headers,
        timeout: 5_000
      },
      (res) => {
        let raw = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          raw += chunk;
        });
        res.on('end', () => {
          let payload = null;
          try {
            payload = raw ? JSON.parse(raw) : null;
          } catch {}

          resolve({
            statusCode: res.statusCode || 500,
            data: payload,
            raw
          });
        });
      }
    );

    req.on('timeout', () => req.destroy(new Error('Control request timeout')));
    req.on('error', reject);

    if (body !== null) {
      req.write(body);
    }

    req.end();
  });
}

module.exports = { callParentControl };
