const express = require('express');
const {
  listTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  listTaskComments,
  createTaskComment
} = require('../controllers/task.controller');

const taskRouter = express.Router();

taskRouter.get('/', listTasks);
taskRouter.get('/:id', getTaskById);
taskRouter.post('/', createTask);
taskRouter.patch('/:id', updateTask);
taskRouter.delete('/:id', deleteTask);
taskRouter.get('/:id/comments', listTaskComments);
taskRouter.post('/:id/comments', createTaskComment);

module.exports = { taskRouter };
