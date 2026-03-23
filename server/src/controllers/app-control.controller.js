const { callParentControl } = require('../services/app-control.service');

async function getApplicationStatus(_req, res, next) {
  try {
    const response = await callParentControl('/status');
    res.status(response.statusCode).json(response.data || { message: 'Unavailable' });
  } catch (error) {
    next(error);
  }
}

async function notifyActivity(_req, res, next) {
  try {
    const response = await callParentControl('/activity', { method: 'POST' });
    res.status(response.statusCode).json(response.data || { ok: false });
  } catch (error) {
    next(error);
  }
}

async function cancelIdleWarning(_req, res, next) {
  try {
    const response = await callParentControl('/cancel-idle-warning', { method: 'POST' });
    res.status(response.statusCode).json(response.data || { ok: false });
  } catch (error) {
    next(error);
  }
}

async function requestApplicationShutdown(_req, res, next) {
  try {
    const response = await callParentControl('/shutdown', { method: 'POST' });
    res.status(response.statusCode).json(response.data || { ok: false });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getApplicationStatus,
  notifyActivity,
  cancelIdleWarning,
  requestApplicationShutdown
};
