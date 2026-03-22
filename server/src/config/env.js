const dotenv = require('dotenv');

dotenv.config();

const env = {
  port: Number(process.env.PORT || 3000),
  databaseUrl: process.env.DATABASE_URL
};

if (!env.databaseUrl) {
  throw new Error('DATABASE_URL is missing. Create a .env file from .env.example.');
}

module.exports = { env };
