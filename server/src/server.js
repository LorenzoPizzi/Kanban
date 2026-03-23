const { app } = require('./app');
const { env } = require('./config/env');
const { prisma } = require('./prisma/client');

let server = null;
let isShuttingDown = false;

async function startServer() {
  try {
    await prisma.$connect();

    server = app.listen(env.port, '127.0.0.1', () => {
      console.log(`Kanban API listening on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
}

startServer();

async function closeServer() {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }

  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGINT', closeServer);
process.on('SIGTERM', closeServer);
