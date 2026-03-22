const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'BLOCKED', 'WAITING', 'DONE'];

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeOptionalString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function validateTaskPayload(payload, isPartial = false) {
  const errors = [];

  if (!isPartial || payload.title !== undefined) {
    if (!isNonEmptyString(payload.title)) {
      errors.push('title is required');
    }
  }

  if (payload.status !== undefined && !TASK_STATUSES.includes(payload.status)) {
    errors.push(`status must be one of: ${TASK_STATUSES.join(', ')}`);
  }

  if (!isPartial || payload.color !== undefined) {
    if (!isNonEmptyString(payload.color)) {
      errors.push('color is required');
    }
  }

  if (payload.description !== undefined && typeof payload.description !== 'string') {
    errors.push('description must be a string');
  }

  return errors;
}

function validateCommentPayload(payload) {
  const errors = [];

  if (!isNonEmptyString(payload.content)) {
    errors.push('content is required');
  }

  return errors;
}

function parseEntityId(value) {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return null;
  }

  return parsedValue;
}

module.exports = {
  TASK_STATUSES,
  normalizeOptionalString,
  parseEntityId,
  validateTaskPayload,
  validateCommentPayload
};
