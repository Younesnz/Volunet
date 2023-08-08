const debug = require('debug')('app:ReportController');
const _ = require('lodash');
const mongoose = require('mongoose');
const { Report, validate } = require('../models/reportModel');
const { Event } = require('../models/eventModel');
const {
  success,
  errorResponse,
  validationError,
} = require('../utils/responseUtils');

exports.addReport = async (req, res) => {
  try {
    req.body.userId = req.userId.toString(); // from Auth
    if (req.body.adminId || req.body.status)
      return res
        .status(400)
        .json(
          errorResponse(
            'cannot set adminId or status while reporting',
            400,
            'validation'
          )
        );

    const { error } = validate(req.body);
    if (error)
      return res
        .status(400)
        .json(validationError(error, error.details[0].message));

    const checkEvent = await Event.findById(req.body.eventId);
    if (!checkEvent) {
      return res
        .status(404)
        .json(errorResponse('Event not found', 404, 'not found'));
    }
    // Check if the user has already reported the event
    const existingReport = await Report.findOne({
      userId: req.userId,
      eventId: req.body.eventId, // the event identifier is in req.body as 'eventId'
    });

    if (existingReport) {
      return res
        .status(409)
        .json(
          errorResponse('You have already reported this post.', 409, 'conflict')
        );
    }

    const report = new Report(req.body);
    const result = await report.save();
    return res.status(200).json(success(result, 'Report added successfully.'));
  } catch (error) {
    debug(error);
    debug(`Error in addReport: ${error}`);
    return res
      .status(500)
      .json(errorResponse('Internal Server Error! failed to save the Report.'));
  }
};

exports.getReports = async (req, res) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json(errorResponse('Forbidden', 403));
    }

    if (!_.isEmpty(req.query)) {
      // acceptable query: status, category, after(time), before(time), userId, adminId, eventId
      const allowedQueries = [
        'status',
        'category',
        'after',
        'before',
        'userId',
        'adminId',
        'eventId',
      ];

      // check if the queries are acceptable
      const reqQueries = Object.keys(req.query);
      const invalidQueries = reqQueries.filter(
        (query) => !allowedQueries.includes(query)
      );
      if (invalidQueries.length > 0)
        return res
          .status(400)
          .json(
            errorResponse(
              `Invalid queries: ${invalidQueries.join(
                ', '
              )}. Acceptable queries: ${allowedQueries.join(', ')}.`,
              400
            )
          );
    }

    const { error } = validate(req.query, false);
    if (error)
      return res
        .status(400)
        .json(validationError(error, error.details[0].message));

    // Converting the before and after timestamp to mongoDB readble date
    const queries = { ...req.query };

    if (req.query.before) {
      delete queries.before;
      queries.createdAt = {
        ...queries.createdAt,
        $lt: new Date(req.query.before),
      };
    }

    if (req.query.after) {
      delete queries.after;
      queries.createdAt = {
        ...queries.createdAt,
        $gt: new Date(req.query.after),
      };
    }

    const result = await Report.find(queries, { __v: 0 })
      .populate({
        path: 'eventId',
        select:
          '_id title description category type date createdAt pictures likes rating ratingCount registeredCount Location organizerId',
      })
      .populate({
        path: 'userId',
        select: '_id username isVerified role profilePic',
      });
    return res
      .status(200)
      .json(success(result, `Found ${result.length} matching report(s).`));
  } catch (error) {
    debug(`Error in getReports: ${error}`);
    return res
      .status(500)
      .json(
        errorResponse('Internal Server Error! failed to fetch the Reports.')
      );
  }
};

exports.getReportById = async (req, res) => {
  const { id } = req.params;
  try {
    if (!req.isAdmin)
      return res.status(403).json(errorResponse('Forbidden', 403));

    const report = await Report.findById(id, { __v: 0 })
      .populate({
        path: 'eventId',
        select:
          '_id title description category type date createdAt pictures likes rating ratingCount registeredCount Location organizerId',
      })
      .populate({
        path: 'userId',
        select: '_id username isVerified role profilePic',
      });
    if (!report)
      return res
        .status(404)
        .json(
          errorResponse(
            `Report with id ${id} does not exist.`,
            404,
            'not found'
          )
        );
    return res.status(200).json(success(report, 'Found successfully.'));
  } catch (error) {
    if (error instanceof mongoose.CastError)
      return res
        .status(400)
        .json(errorResponse(`Invalid Report Id: ${id}`, 400, 'validation'));
    debug(`Error in getReportById: ${error}`);
    return res
      .status(500)
      .json(
        errorResponse(
          'Internal Server Error! failed to fetch the Report by Id.'
        )
      );
  }
};

exports.updateReportById = async (req, res) => {
  const { id } = req.params;
  try {
    if (!req.isAdmin)
      return res.staus(403).json(errorResponse('Forbidden', 403));

    if (_.isEmpty(req.body))
      return res
        .status(400)
        .json(errorResponse('No data to update', 400, 'validation'));

    if (req.body.userId || req.body.eventId)
      return res
        .status(400)
        .json(
          errorResponse('Cannot update userId or eventId', 400, 'validation')
        );

    req.body.adminId = req.userId.toString();
    const { error } = validate(req.body, false);
    if (error)
      return res
        .status(400)
        .json(validationError(error, error.details[0].message));
    const result = await Report.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!result)
      return res
        .status(404)
        .json(errorResponse(`Report with id ${id} does not exist.`, 404));

    return res
      .status(200)
      .json(success(result, 'Report updated successfully.'));
  } catch (error) {
    if (error instanceof mongoose.CastError)
      return res
        .status(400)
        .json(errorResponse(`Invalid Report Id: ${id}`, 400));
    debug(`Error in updateReportById: ${error}`);
    return res
      .status(500)
      .json(
        errorResponse(
          'Internal Server Error! failed to update the Report by Id.'
        )
      );
  }
};

exports.deleteReportById = async (req, res) => {
  const { id } = req.params;
  try {
    if (!req.isAdmin)
      return res.status(403).json(errorResponse('Forbidden', 403));

    const result = await Report.findByIdAndDelete(id);
    if (!result)
      return res
        .status(404)
        .json(
          errorResponse(
            `Report with id ${id} does not exist.`,
            404,
            'not found'
          )
        );
    return res
      .status(200)
      .json(success(result, 'Report deleted successfully.'));
  } catch (error) {
    if (error instanceof mongoose.CastError)
      return res
        .status(400)
        .json(errorResponse(`Invalid Report Id: ${id}`, 400, 'validation'));
    debug(`Error in deleteReportById: ${error}`);
    return res
      .status(500)
      .json(
        errorResponse(
          'Internal Server Error! failed to delete the Report by Id.'
        )
      );
  }
};
