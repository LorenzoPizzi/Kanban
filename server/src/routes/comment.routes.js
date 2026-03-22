const express = require('express');
const { deleteComment } = require('../controllers/comment.controller');

const commentRouter = express.Router();

commentRouter.delete('/:id', deleteComment);

module.exports = { commentRouter };
