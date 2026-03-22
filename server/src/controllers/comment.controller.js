const { prisma } = require('../prisma/client');
const { parseEntityId } = require('../utils/validators');

async function deleteComment(req, res, next) {
  try {
    const commentId = parseEntityId(req.params.id);

    if (!commentId) {
      return res.status(400).json({ message: 'Comment id must be a positive integer' });
    }

    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId }
    });

    if (!existingComment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    await prisma.comment.delete({
      where: { id: commentId }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  deleteComment
};
