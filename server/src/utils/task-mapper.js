function mapTask(task) {
  return {
    ...task,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    comments: task.comments
      ? task.comments.map((comment) => ({
          ...comment,
          createdAt: comment.createdAt.toISOString()
        }))
      : undefined
  };
}

function mapComment(comment) {
  return {
    ...comment,
    createdAt: comment.createdAt.toISOString()
  };
}

module.exports = {
  mapTask,
  mapComment
};
