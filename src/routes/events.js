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

module.exports = router;
