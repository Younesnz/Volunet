const debug = require('debug')('app:eventController');
const mongoose = require('mongoose');
const { Event, validate, validateQuery } = require('../models/eventModel');
const { User } = require('../models/userModel');
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

// TODO: organizer by Auth
exports.addEvent = async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error)
      return res
        .status(400)
        .json(validationError(error, error.details[0].message));
    const application = new Application({
      eventId: null, // Placeholder
      userId: req.body.organizerId, // TODO: set by Auth
    });

    const event = new Event({
      ...req.body,
      applicationId: application._id,
    });

    application.eventId = event._id;

    const [savedEvent, savedApplication] = await Promise.all([
      event.save(),
      application.save(),
    ]);

    return res
      .status(200)
      .json(
        success(
          { ...savedEvent, application: savedApplication },
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
    const result = await Event.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!result)
      return res
        .status(404)
        .json(errorResponse(`Event with id ${id} does not exist.`, 404));

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
          'Internal Server Error! failed to update the Event by Id.'
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
    if (createdBefore) filters.createdAt = { $lt: new Date(+createdBefore) };
    if (createdAfter)
      filters.createdAt = {
        ...(filters.createdAt || {}),
        $gt: new Date(+createdAfter),
      };
    if (startsBefore) filters.date = { $lt: new Date(+startsBefore) };
    if (startsAfter)
      filters.date = {
        ...(filters.date || {}),
        $gt: new Date(+startsAfter),
      };
    if (country) filters['location.country'] = country;
    if (city) filters['location.city'] = city;
    if (near) {
      const { lon, lat } = near;
      filters['location.point'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lon), parseFloat(lat)],
          },
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
        match: { status: 'accepted' },
        select: '_id',
        model: Application,
      });

    // ordering
    let sort;
    if (orderBy === 'time') sort = { date: 1 };
    else if (orderBy === 'likes') sort = { likes: -1 };
    else if (orderBy === 'rating') sort = { rating: -1 };
    else sort = { date: 1 };

    query.sort(sort);

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
    const result = await Event.findByIdAndDelete(id);
    if (!result)
      return res
        .status(404)
        .json(errorResponse(`Event with id ${id} does not exist.`, 404));
    return res.status(200).json(success(result, 'Event deleted successfully.'));
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
          'Internal Server Error! failed to delete the Event by Id.'
        )
      );
  }
};

exports.updateLikes = async (req, res) => res.send(req);

exports.addComment = async (req, res) => res.send(req);

exports.deleteCommentById = async (req, res) => res.send(req);

exports.updateRating = async (req, res) => res.send(req);

exports.addUserToEvent = async (req, res) => res.send(req);

exports.deleteUserFromEvent = async (req, res) => res.send(req);
