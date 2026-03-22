const { prisma } = require('../prisma/client');
const { mapTask, mapComment } = require('../utils/task-mapper');
const {
  normalizeOptionalString,
  parseEntityId,
  validateTaskPayload,
  validateCommentPayload
} = require('../utils/validators');

async function listTasks(req, res, next) {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        comments: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: [
        { createdAt: 'desc' },
        { id: 'desc' }
      ]
    });

    res.json(tasks.map(mapTask));
  } catch (error) {
    next(error);
  }
}

async function getTaskById(req, res, next) {
  try {
    const taskId = parseEntityId(req.params.id);

    if (!taskId) {
      return res.status(400).json({ message: 'Task id must be a positive integer' });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        comments: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(mapTask(task));
  } catch (error) {
    next(error);
  }
}

async function createTask(req, res, next) {
  try {
    const errors = validateTaskPayload(req.body);

    if (errors.length > 0) {
      return res.status(400).json({ message: 'Invalid task payload', errors });
    }

    const task = await prisma.task.create({
      data: {
        title: req.body.title.trim(),
        description: normalizeOptionalString(req.body.description),
        status: req.body.status || 'TODO',
        color: req.body.color.trim()
      },
      include: {
        comments: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    res.status(201).json(mapTask(task));
  } catch (error) {
    next(error);
  }
}

async function updateTask(req, res, next) {
  try {
    const taskId = parseEntityId(req.params.id);
    const errors = validateTaskPayload(req.body, true);

    if (!taskId) {
      return res.status(400).json({ message: 'Task id must be a positive integer' });
    }

    if (errors.length > 0) {
      return res.status(400).json({ message: 'Invalid task payload', errors });
    }

    const existingTask = await prisma.task.findUnique({ where: { id: taskId } });

    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const data = {};

    if (req.body.title !== undefined) {
      data.title = req.body.title.trim();
    }

    if (req.body.description !== undefined) {
      data.description = normalizeOptionalString(req.body.description);
    }

    if (req.body.status !== undefined) {
      data.status = req.body.status;
    }

    if (req.body.color !== undefined) {
      data.color = req.body.color.trim();
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data,
      include: {
        comments: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    res.json(mapTask(task));
  } catch (error) {
    next(error);
  }
}

async function deleteTask(req, res, next) {
  try {
    const taskId = parseEntityId(req.params.id);

    if (!taskId) {
      return res.status(400).json({ message: 'Task id must be a positive integer' });
    }

    const existingTask = await prisma.task.findUnique({ where: { id: taskId } });

    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await prisma.task.delete({
      where: { id: taskId }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

async function listTaskComments(req, res, next) {
  try {
    const taskId = parseEntityId(req.params.id);

    if (!taskId) {
      return res.status(400).json({ message: 'Task id must be a positive integer' });
    }

    const task = await prisma.task.findUnique({ where: { id: taskId } });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const comments = await prisma.comment.findMany({
      where: { taskId },
      orderBy: {
        createdAt: 'asc'
      }
    });

    res.json(comments.map(mapComment));
  } catch (error) {
    next(error);
  }
}

async function createTaskComment(req, res, next) {
  try {
    const taskId = parseEntityId(req.params.id);
    const errors = validateCommentPayload(req.body);

    if (!taskId) {
      return res.status(400).json({ message: 'Task id must be a positive integer' });
    }

    if (errors.length > 0) {
      return res.status(400).json({ message: 'Invalid comment payload', errors });
    }

    const task = await prisma.task.findUnique({ where: { id: taskId } });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const comment = await prisma.comment.create({
      data: {
        content: req.body.content.trim(),
        taskId
      }
    });

    res.status(201).json(mapComment(comment));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  listTaskComments,
  createTaskComment
};
