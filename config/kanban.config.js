const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const runtimeDir = path.join(rootDir, '.runtime');

const ports = {
  frontend: 4318,
  backend: 4319,
  control: 4320
};

const inactivity = {
  enabled: false,
  idleMs: 6 * 60 * 60 * 1000,
  warningMs: 5 * 60 * 1000,
  activityThrottleMs: 30 * 1000,
  statusPollMs: 30 * 1000
};

module.exports = {
  appName: 'Kanban local',
  ports,
  inactivity,
  paths: {
    rootDir,
    runtimeDir,
    stateFile: path.join(runtimeDir, 'kanban-state.json'),
    frontendDistDir: path.join(rootDir, 'client', 'dist', 'client', 'browser'),
    frontendRootDir: path.join(rootDir, 'client'),
    backendRootDir: path.join(rootDir, 'server'),
    backendDatabaseFile: path.join(rootDir, 'server', 'prisma', 'kanban-local.db')
  },
  urls: {
    frontend: `http://127.0.0.1:${ports.frontend}`,
    backend: `http://127.0.0.1:${ports.backend}`,
    control: `http://127.0.0.1:${ports.control}`
  }
};
