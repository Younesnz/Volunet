const express = require('express');

const router = express.Router();

const eventController = require('../controllers/eventController');

router.post('/', eventController.addEvent);
router.get('/:id', eventController.getEventById);
router.get('/', eventController.getEvents);
router.put('/:id', eventController.updateEventById);
router.delete('/:id', eventController.deleteEventById);

router.put('/:id/likes', eventController.updateLikes);
router.post('/:id/comments', eventController.addComment);
router.delete('/:id/comments/:commentId', eventController.deleteCommentById);
router.put('/:id/rating', eventController.updateRating);
router.post('/:id/users', eventController.addUserToEvent);
router.delete('/:id/users', eventController.deleteUserFromEvent);

module.exports = router;
