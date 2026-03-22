const { app } = require('./app');
const { env } = require('./config/env');
const { prisma } = require('./prisma/client');

async function startServer() {
  try {
    await prisma.$connect();

    app.listen(env.port, () => {
      console.log(`Kanban API listening on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
}

startServer();

async function closeServer() {
  await prisma.$disconnect();
}

process.on('SIGINT', closeServer);
process.on('SIGTERM', closeServer);
