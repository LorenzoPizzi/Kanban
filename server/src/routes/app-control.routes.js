const express = require('express');

const {
  getApplicationStatus,
  notifyActivity,
  cancelIdleWarning,
  requestApplicationShutdown
} = require('../controllers/app-control.controller');

const appControlRouter = express.Router();

appControlRouter.get('/status', getApplicationStatus);
appControlRouter.post('/activity', notifyActivity);
appControlRouter.post('/cancel-idle-warning', cancelIdleWarning);
appControlRouter.post('/quit', requestApplicationShutdown);

module.exports = { appControlRouter };
