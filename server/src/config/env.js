const dotenv = require('dotenv');
const config = require('../../../config/kanban.config');

dotenv.config();

const env = {
  port: Number(process.env.PORT || config.ports.backend),
  databaseUrl: process.env.DATABASE_URL || 'file:./kanban-local.db',
  frontendOrigin: process.env.FRONTEND_ORIGIN || config.urls.frontend,
  parentControlUrl: process.env.KANBAN_PARENT_CONTROL_URL || config.urls.control,
  controlSecret: process.env.KANBAN_CONTROL_SECRET || ''
};

if (!env.databaseUrl) {
  throw new Error('DATABASE_URL is missing. Create a .env file from .env.example.');
}

module.exports = { env };
