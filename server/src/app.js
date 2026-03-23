const express = require('express');
const cors = require('cors');

const { taskRouter } = require('./routes/task.routes');
const { commentRouter } = require('./routes/comment.routes');
const { appControlRouter } = require('./routes/app-control.routes');
const { errorHandler } = require('./middlewares/error-handler');
const { notFoundHandler } = require('./middlewares/not-found');
const { env } = require('./config/env');

const app = express();

app.use(
  cors({
    origin: [env.frontendOrigin]
  })
);
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/tasks', taskRouter);
app.use('/api/comments', commentRouter);
app.use('/api/app-control', appControlRouter);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = { app };
