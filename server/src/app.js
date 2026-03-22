const express = require('express');
const cors = require('cors');

const { taskRouter } = require('./routes/task.routes');
const { commentRouter } = require('./routes/comment.routes');
const { errorHandler } = require('./middlewares/error-handler');
const { notFoundHandler } = require('./middlewares/not-found');

const app = express();

app.use(
  cors({
    origin: ['http://localhost:4200', 'http://127.0.0.1:4200']
  })
);
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/tasks', taskRouter);
app.use('/api/comments', commentRouter);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = { app };
