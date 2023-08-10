const express = require('express');

const router = express.Router();

const eventController = require('../controllers/eventController');

const { authenticate, adminOnly } = require('../middleware/auth');

router.post('/', authenticate, eventController.addEvent);
router.get('/:id', eventController.getEventById);
router.get('/', eventController.getEvents);

router.put('/:id', authenticate, eventController.updateEventById);
router.delete('/:id', authenticate, adminOnly, eventController.deleteEventById);

router.put('/:id/likes', authenticate, eventController.updateLikes);
router.post('/:id/comments', authenticate, eventController.addComment);
router.delete(
  '/:eventId/comments/:commentId',
  authenticate,
  eventController.deleteCommentById
);
router.put('/:id/rating', authenticate, eventController.updateRating);
router.post('/:id/users', authenticate, eventController.addUserToEvent);
router.delete('/:id/users', authenticate, eventController.deleteUserFromEvent);

module.exports = router;
