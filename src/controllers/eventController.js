const debug = require('debug')('app:eventController');
const mongoose = require('mongoose');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const { Event, validate, validateQuery } = require('../models/eventModel');
const User = require('../models/userModel');
const { Application } = require('../models/applicationModel');
const {
  success,
  errorResponse,
  validationError,
} = require('../utils/responseUtils');

exports.getEventById = async (req, res) => {
  const { id } = req.params;
  try {
    const event = await Event.findById(id, { __v: 0 })
      .populate({
        path: 'organizerId',
        select: '_id username role isVerified profilePic',
      })
      .populate({
        path: 'applicationId',
        select: '_id status',
      })
      .populate({
        path: 'comments.userId',
        select: '_id username role isVerified profilePic',
      });
    if (!event)
      return res
        .status(404)
        .json(errorResponse(`Event with id ${id} does not exist.`, 404));
    return res.status(200).json(success(event, 'Found successfully.'));
  } catch (error) {
    if (error instanceof mongoose.CastError)
      return res
        .status(400)
        .json(errorResponse(`Invalid event Id: ${id}`, 400));
    debug(`Error in getEventById: ${error}`);
    return res
      .status(500)
      .json(
        errorResponse('Internal Server Error! failed to fetch the event by Id.')
      );
  }
};

exports.addEvent = async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error)
      return res
        .status(400)
        .json(validationError(error, error.details[0].message));

    if (req.body.type !== 'online') {
      req.body.location = {
        point: {
          type: 'Point',
          coordinates: [req.body.lon, req.body.lat],
        },
        country: req.body.country,
        city: req.body.city,
        address: req.body.address,
      };
    }

    const application = new Application({
      eventId: null, // Placeholder
      userId: req.userId,
    });

    const event = new Event({
      ...req.body,
      applicationId: application._id,
      organizerId: req.userId,
    });

    application.eventId = event._id;

    const [savedEvent, savedApplication] = await Promise.all([
      event.save(),
      application.save(),
    ]);

    await User.findByIdAndUpdate(req.userId, {
      $push: { createdEvents: event._id },
    });

    return res
      .status(200)
      .json(
        success(
          { ...savedEvent.toObject(), application: savedApplication },
          'Event added successfully.'
        )
      );
  } catch (error) {
    debug(error);
    debug(`Error in addEvent: ${error}`);
    return res
      .status(500)
      .json(errorResponse('Internal Server Error! failed to save the Event.'));
  }
};

exports.updateEventById = async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = validate(req.body, false);
    if (error)
      return res
        .status(400)
        .json(validationError(error, error.details[0].message));

    // Check if the event exists
    const event = await Event.findById(id);
    if (!event)
      return res
        .status(404)
        .json(errorResponse(`Event with id ${id} does not exist.`, 404));

    // Check if the current user is an admin or the organizer of the event
    if (!req.isAdmin && event.organizerId.toString() !== req.userId.toString())
      return res
        .status(403)
        .json(errorResponse('Access denied.', 403, 'Authorization'));

    if (
      req.body.type !== 'online' &&
      (req.body.lon ||
        req.body.lat ||
        req.body.country ||
        req.body.city ||
        req.body.address)
    ) {
      if (!event.location) {
        event.location = {
          point: {
            type: 'Point',
            coordinates: [0, 0],
          },
        };
      }
      if (req.body.lon) event.location.point.coordinates[0] = req.body.lon;
      if (req.body.lat) event.location.point.coordinates[1] = req.body.lat;
      if (req.body.country) event.location.country = req.body.country;
      if (req.body.city) event.location.city = req.body.city;
      if (req.body.address) event.location.address = req.body.address;

      await event.save();
    }

    if (
      req.body.contactPhone ||
      req.body.contactEmail ||
      req.body.contactWebsite
    ) {
      const { contactPhone, contactEmail, contactWebsite, ...others } =
        req.body;
      req.body = others;
      if (!event.contact) event.contact = {};

      if (contactPhone) event.contact.phone = contactPhone;
      if (contactEmail) event.contact.email = contactEmail;
      if (contactWebsite) event.contact.website = contactWebsite;
      await event.save();
    }

    const result = await Event.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    return res.status(200).json(success(result, 'Event updated successfully.'));
  } catch (error) {
    if (error instanceof mongoose.CastError)
      return res
        .status(400)
        .json(errorResponse(`Invalid Event Id: ${id}`, 400));
    debug(`Error in updateEventById: ${error}`);
    return res
      .status(500)
      .json(
        errorResponse(
          'Internal Server Error! Failed to update the Event by Id.'
        )
      );
  }
};

exports.getEvents = async (req, res) => {
  try {
    // validate the filter query with Joi
    const { error } = validateQuery(req.query);
    if (error)
      return res
        .status(400)
        .json(validationError(error, error.details[0].message));

    const filters = {};
    const {
      title,
      category,
      type,
      createdBefore,
      createdAfter,
      startsBefore,
      startsAfter = Date.now(),
      country,
      city,
      near,
      orderBy = 'time',
      limit = 20,
    } = req.query;

    // filters

    if (title) filters.title = { $regex: title, $options: 'i' }; // searching for title
    if (category) filters.category = category;
    if (type) filters.type = type;
    if (createdBefore) filters.createdAt = { $lt: new Date(createdBefore) };
    if (createdAfter)
      filters.createdAt = {
        ...(filters.createdAt || {}),
        $gt: new Date(createdAfter),
      };
    if (startsBefore) filters.date = { $lt: new Date(startsBefore) };
    if (startsAfter)
      filters.date = {
        ...(filters.date || {}),
        $gt: new Date(startsAfter),
      };
    if (country) filters['location.country'] = country.toLowerCase();
    if (city) filters['location.city'] = city.toLowerCase();
    if (near) {
      const lon = near[0];
      const lat = near[1];
      filters['location.point'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lon), parseFloat(lat)],
          },
          $maxDistance: 50000, // 50 KM
        },
      };
    }

    // populating the organizer and application
    const query = Event.find(filters)
      .populate({
        path: 'organizerId',
        select: '_id username role isVerified profilePic',
        model: User,
      })
      .populate({
        path: 'applicationId',
        match: { status: 'accepted' }, // only accepted events
        select: '_id',
        model: Application,
      });

    if (!near) {
      // if we have near property, it will order them by distance
      // ordering
      let sort;
      if (orderBy === 'time') sort = { date: 1 };
      else if (orderBy === 'likes') sort = { likes: -1 };
      else if (orderBy === 'rating') sort = { rating: -1 };
      else sort = { date: 1 };

      query.sort(sort);
    }

    // limiting
    query.limit(+limit);

    // fetch from db
    let events = await query.exec();

    // modify the result to show only number of comments (for making the response shorter)
    events = events.map((event) => {
      const commentCount = event.comments ? event.comments.length : 0;
      return { ...event.toObject(), comments: commentCount };
    });

    // filter events to show only accepted ones
    events = events.filter(
      (event) =>
        event.applicationId !== null && event.applicationId !== undefined
    );

    return res
      .status(200)
      .json(success(events, `Showing ${events.length} matching Events.`));
  } catch (error) {
    debug(`Error in getEvents: ${error}`);
    return res
      .status(500)
      .json(
        errorResponse('Internal Server Error! failed to fetch the Events.')
      );
  }
};

exports.deleteEventById = async (req, res) => {
  const { id } = req.params;
  try {
    // Check if the event exists
    const event = await Event.findById(id);
    if (!event)
      return res
        .status(404)
        .json(errorResponse(`Event with id ${id} does not exist.`, 404));

    // Check if the current user is an admin
    if (!req.isAdmin)
      return res.status(403).json(errorResponse('Access denied.', 403));

    // If the current user is an admin, proceed with deletion
    const application = await Application.findByIdAndDelete(
      event.applicationId
    );
    const createdEvents = await User.findByIdAndUpdate(
      event.organizerId,
      {
        $pull: { createdEvents: event._id },
      },
      { new: true }
    ).select('createdEvents');
    // TODO: delete reports of event ??
    const result = await Event.findByIdAndDelete(id);
    return res.status(200).json(
      success(
        {
          deletedEvent: result.toObject(),
          deletedApplication: application.toObject(),
          newUserCreatedEvents: createdEvents.toObject().createdEvents,
        },
        'Event deleted successfully.'
      )
    );
  } catch (error) {
    if (error instanceof mongoose.CastError)
      return res
        .status(400)
        .json(errorResponse(`Invalid Event Id: ${id}`, 400));
    debug(`Error in deleteEventById: ${error}`);
    return res
      .status(500)
      .json(
        errorResponse(
          'Internal Server Error! Failed to delete the Event by Id.'
        )
      );
  }
};

exports.updateLikes = async (req, res) => {
  const { userId } = req; // from Auth
  const { id: eventId } = req.params;
  const { action } = req.body;
  try {
    if (!userId)
      return res.status(401).json(errorResponse('Unauthorized', 401));
    if (!action || (action !== 'like' && action !== 'unlike'))
      return res
        .status(400)
        .json(errorResponse('Bad Request! Action is not defined.', 400));

    // Check if the user has already liked the event and action is like
    if (action === 'like') {
      const userLikedEvent = await User.findOne({
        _id: userId,
        likedEvents: eventId,
      });
      if (userLikedEvent)
        return res
          .status(409)
          .json(errorResponse('User already liked the event', 409, 'conflict'));
    }

    // Check if the user has not liked the event and action is unlike
    if (action === 'unlike') {
      const userLikedEvent = await User.findOne({
        _id: userId,
        likedEvents: eventId,
      });
      if (!userLikedEvent)
        return res
          .status(409)
          .json(errorResponse('User has not liked the event', 409, 'conflict'));
    }

    const value = action === 'like' ? 1 : -1;
    const result = await Event.findByIdAndUpdate(
      eventId,
      { $inc: { likes: value } },
      { new: true }
    );
    if (!result)
      return res
        .status(404)
        .json(errorResponse(`Event with ID: ${eventId} not found`, 404));
    // Adding the event to user liked events list or remove it
    const arrayAction = action === 'like' ? '$push' : '$pull';
    const userResult = await User.findByIdAndUpdate(userId, {
      [arrayAction]: { likedEvents: eventId },
    });
    if (!userResult) {
      // reverse the like
      await Event.findByIdAndUpdate(eventId, { $inc: { likes: -value } });

      return res
        .status(404)
        .json(errorResponse(`User with ID: ${userId} not found`, 404));
    }
    return res
      .status(200)
      .json(
        success(
          { newLikes: result.likes, oldLikes: result.likes - value },
          `Like ${action === 'like' ? 'added' : 'removed'}.`
        )
      );
  } catch (error) {
    if (error instanceof mongoose.CastError)
      return res
        .status(400)
        .json(errorResponse(`Invalid Event Id: ${eventId}`, 400));
    debug(`Error in updateLikes: ${error}`);
    return res
      .status(500)
      .json(
        errorResponse(
          'Internal Server Error! failed to update the Event Likes.'
        )
      );
  }
};

exports.addComment = async (req, res) => {
  const { userId } = req; // from Auth
  const { id: eventId } = req.params;
  try {
    const { error: userIdError } = Joi.object({
      userId: Joi.objectId().required(),
    }).validate({ userId: userId.toString() });
    if (userIdError)
      return res
        .status(401)
        .json(errorResponse('Unauthorized! User Id is not valid.', 401));

    const { error: eventIdError } = Joi.object({
      eventId: Joi.objectId().required(),
    }).validate({ eventId });
    if (eventIdError)
      return res
        .status(400)
        .json(validationError(eventIdError, eventIdError.details[0].message));

    const { error: commentValidationError } = Joi.object({
      text: Joi.string().min(1).max(200).required(),
    }).validate(req.body);

    if (commentValidationError)
      return res
        .status(400)
        .json(
          validationError(
            commentValidationError,
            commentValidationError.details[0].message
          )
        );
    const result = await Event.findByIdAndUpdate(
      eventId,
      {
        $push: {
          comments: {
            userId,
            text: req.body.text,
          },
        },
      },
      { new: true }
    );

    if (!result)
      return res
        .status(404)
        .json(errorResponse(`Event with ID: ${eventId} does not exist.`, 404));

    return res
      .status(201)
      .json(success(result.toObject().comments, 'Comment added successfully.'));
  } catch (error) {
    if (error instanceof mongoose.CastError)
      return res
        .status(400)
        .json(errorResponse(`Invalid Event or User ID`, 400));
    debug(`Error in addComment: ${error}`);
    return res
      .status(500)
      .json(errorResponse('Internal Server Error! failed to add comment'));
  }
};

exports.deleteCommentById = async (req, res) => {
  const { eventId, commentId } = req.params;
  const { userId, isAdmin } = req; // from Auth
  try {
    const { error: commentIdError } = Joi.object({
      commentId: Joi.objectId().required(),
    }).validate({ commentId });
    if (commentIdError)
      return res
        .status(400)
        .json(validationError(commentIdError, 'Invalid Comment Id'));

    const { error: eventIdError } = Joi.object({
      eventId: Joi.objectId().required(),
    }).validate({ eventId });
    if (eventIdError)
      return res
        .status(400)
        .json(validationError(eventIdError, 'Invalid Event Id'));

    const event = await Event.findById(eventId);

    if (!event)
      return res
        .status(404)
        .json(errorResponse(`Event with ID: ${eventId} not found`, 404));

    const commentToDelete = event.comments.find(
      (comment) => comment._id.toString() === commentId
    );

    if (!commentToDelete)
      return res
        .status(404)
        .json(
          errorResponse(
            `Comment with ID: ${commentId} in Event ${eventId} not found`,
            404
          )
        );

    // Check if the user is authorized to delete the comment
    if (commentToDelete.userId.toString() !== userId.toString() && !isAdmin)
      return res
        .status(403)
        .json(
          errorResponse(
            'Access Denied! Unauthorized to delete this comment.',
            403,
            'forbidden'
          )
        );

    const result = await Event.findByIdAndUpdate(
      eventId,
      {
        $pull: {
          comments: {
            _id: commentId,
          },
        },
      },
      { new: true }
    );

    return res
      .status(200)
      .json(
        success(result.toObject().comments, 'Comment deleted successfully.')
      );
  } catch (error) {
    debug(`Error in deleteCommentById: ${error}`);
    return res
      .status(500)
      .json(errorResponse('Internal Server Error! Failed to delete comment'));
  }
};

exports.updateRating = async (req, res) => {
  const { id: eventId } = req.params;
  const { userId } = req;
  const { action, rating } = req.body;

  try {
    // Validate event and user IDs
    const { error: eventIdError } = Joi.object({
      eventId: Joi.objectId().required(),
    }).validate({ eventId });
    if (eventIdError)
      return res
        .status(400)
        .json(validationError(eventIdError, 'Invalid Event Id'));

    const { error: userIdError } = Joi.object({
      userId: Joi.objectId().required(),
    }).validate({ userId: userId.toString() });
    if (userIdError)
      return res
        .status(400)
        .json(validationError(userIdError, 'Invalid User Id'));

    // Validate the request body for action and rating
    const { error: actionError } = Joi.object({
      action: Joi.string().valid('rate', 'unrate').required(),
      rating: Joi.number()
        .min(1)
        .max(5)
        .when('action', { is: 'rate', then: Joi.required() }),
    }).validate(req.body);

    if (actionError)
      return res
        .status(400)
        .json(validationError(actionError, actionError.details[0].message));

    // Check if the event exists
    const event = await Event.findById(eventId);

    if (!event)
      return res
        .status(404)
        .json(errorResponse(`Event with ID: ${eventId} not found`, 404));

    // Fetch the user from the database based on userId
    const user = await User.findById(userId);

    // Check if the user has already rated this event
    const ratedEventIndex = user.ratedEvents.findIndex(
      (ratedEvent) => ratedEvent.eventId.toString() === eventId
    );

    if (action === 'rate') {
      if (ratedEventIndex !== -1)
        return res
          .status(409)
          .json(
            errorResponse('You have already rated this event.', 409, 'conflict')
          );

      // Calculate the new average rating and update the event
      if (event.ratingCount === 0) {
        event.rating = rating;
        event.ratingCount = 1;
      } else {
        const newRatingCount = event.ratingCount + 1;
        const newTotalRating = event.rating * event.ratingCount + +rating; // +rating converts the string to a number
        const newAverageRating = newTotalRating / newRatingCount;

        // Update the event with the new rating and ratingCount
        event.rating = newAverageRating;
        event.ratingCount = newRatingCount;
      }
      // Add the rated event to the user's ratedEvents array
      user.ratedEvents.push({
        eventId,
        rating,
      });
    } else if (action === 'unrate') {
      if (ratedEventIndex === -1)
        return res
          .status(409)
          .json(
            errorResponse("You haven't rated this event.", 409, 'conflict')
          );

      const removedRating = user.ratedEvents.splice(ratedEventIndex, 1)[0]
        .rating;

      // Calculate the new average rating and update the event
      const newRatingCount = event.ratingCount - 1;
      const newTotalRating = event.rating * event.ratingCount - removedRating;
      const newAverageRating =
        newRatingCount > 0 ? newTotalRating / newRatingCount : 0;

      // Update the event with the new rating and ratingCount
      event.rating = newAverageRating;
      event.ratingCount = newRatingCount;
    }

    // Save the changes to the event and the user
    await event.save();
    await user.save();

    return res.status(200).json(
      success({
        rating: action === 'rate' ? +rating : null,
        averageRating: event.rating,
        ratingCount: event.ratingCount,
      })
    );
  } catch (error) {
    debug(`Error in updateRating: ${error}`);
    return res
      .status(500)
      .json(errorResponse('Internal Server Error! Failed to update rating'));
  }
};

exports.addUserToEvent = async (req, res) => {
  const { id: eventId } = req.params;
  const { userId } = req;

  try {
    // Validate event and user IDs
    const { error: eventIdError } = Joi.object({
      eventId: Joi.objectId().required(),
    }).validate({ eventId });
    if (eventIdError)
      return res
        .status(400)
        .json(validationError(eventIdError, 'Invalid Event Id'));

    const { error: userIdError } = Joi.object({
      userId: Joi.objectId().required(),
    }).validate({ userId: userId.toString() });
    if (userIdError)
      return res
        .status(400)
        .json(validationError(userIdError, 'Invalid User Id'));

    // Check if the event exists
    const event = await Event.findById(eventId);

    if (!event)
      return res
        .status(404)
        .json(errorResponse(`Event with ID: ${eventId} not found`, 404));

    // Check if the user exists
    const user = await User.findById(userId);

    if (!user)
      return res
        .status(404)
        .json(errorResponse(`User with ID: ${userId} not found`, 404));

    // Check if the user is already part of the event
    const isUserJoined = user.joinedEvents.some((joinedEventId) =>
      joinedEventId.equals(eventId)
    );

    if (isUserJoined)
      return res
        .status(409)
        .json(
          errorResponse('User is already part of this event', 409, 'conflict')
        );

    // Add the event to the user's joinedEvents array
    user.joinedEvents.push(eventId);

    // Save the changes to the user
    await user.save();

    return res
      .status(200)
      .json(success({ eventId, userId }, 'User added to event successfully.'));
  } catch (error) {
    debug(`Error in addUserToEvent: ${error}`);
    return res
      .status(500)
      .json(
        errorResponse('Internal Server Error! Failed to add user to event')
      );
  }
};

exports.deleteUserFromEvent = async (req, res) => {
  const { id: eventId } = req.params;
  const { userId } = req;

  try {
    // Validate event and user IDs
    const { error: eventIdError } = Joi.object({
      eventId: Joi.objectId().required(),
    }).validate({ eventId });
    if (eventIdError)
      return res
        .status(400)
        .json(validationError(eventIdError, 'Invalid Event Id'));

    const { error: userIdError } = Joi.object({
      userId: Joi.objectId().required(),
    }).validate({ userId: userId.toString() });
    if (userIdError)
      return res
        .status(400)
        .json(validationError(userIdError, 'Invalid User Id'));

    // Check if the event exists
    const event = await Event.findById(eventId);

    if (!event)
      return res
        .status(404)
        .json(errorResponse(`Event with ID: ${eventId} not found`, 404));

    // Check if the user exists
    const user = await User.findById(userId);

    if (!user)
      return res
        .status(404)
        .json(errorResponse(`User with ID: ${userId} not found`, 404));

    // Check if the user is part of the event
    const isUserJoined = user.joinedEvents.some((joinedEventId) =>
      joinedEventId.equals(eventId)
    );

    if (!isUserJoined)
      return res
        .status(409)
        .json(errorResponse('User is not part of this event', 409, 'conflict'));

    // Remove the event from the user's joinedEvents array
    user.joinedEvents = user.joinedEvents.filter(
      (joinedEventId) => !joinedEventId.equals(eventId)
    );

    // Save the changes to the user
    await user.save();

    return res
      .status(200)
      .json(
        success({ eventId, userId }, 'User removed from event successfully.')
      );
  } catch (error) {
    debug(`Error in deleteUserFromEvent: ${error}`);
    return res
      .status(500)
      .json(
        errorResponse('Internal Server Error! Failed to remove user from event')
      );
  }
};
