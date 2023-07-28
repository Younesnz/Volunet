const debug = require('debug')('app:applicationController');
const mongoose = require('mongoose');
const { Application, validate } = require('../models/applicationModel');
const { User } = require('../models/userModel');
const {
  success,
  validationError,
  errorResponse,
} = require('../utils/responseUtils');

// this is for testing, applications will be added while creating events
// exports.testAddApp = async (req, res) => {
//     try {
//         const { error } = validate(req.body);
//         if (error)
//             return res
//                 .status(400)
//                 .json(validationError(error, error.details[0].message));
//         const app = new Application(req.body);
//         const result = await app.save();
//         return res.status(200).json(success(result, 'application saved.'));
//     } catch (error) {
//         debug(`error in AddApp: ${error}`);
//         return res
//             .status(500)
//             .json(
//                 errorResponse(
//                     'Internal Server Error: failed to add application'
//                 )
//             );
//     }
// };

exports.getAppById = async (req, res) => {
  const { id } = req.params;
  try {
    const app = await Application.findById(id, { __v: 0 })
      .populate({
        path: 'eventId',
        select:
          '_id title description category type date createdAt pictures likes rating ratingCount registeredCount Location organizerId',
      })
      .populate({
        path: 'userId',
        select: '_id username isVerified role profilePic',
      });
    if (!app)
      return res
        .status(404)
        .json(errorResponse(`Application with id ${id} does not exist.`, 404));

    if (app.userId.toString() !== req.userId && !req.isAdmin)
      return res
        .status(403)
        .json(
          errorResponse(
            'You are not authorized to access this Application.',
            403
          )
        );

    return res.status(200).json(success(app, 'Found successfully.'));
  } catch (error) {
    if (error instanceof mongoose.CastError)
      return res
        .status(400)
        .json(errorResponse(`Invalid Application Id: ${id}`, 400));
    debug(`Error in getAppById: ${error}`);
    return res
      .status(500)
      .json(
        errorResponse(
          'Internal Server Error! failed to fetch the Application by Id.'
        )
      );
  }
};

exports.updateAppById = async (req, res) => {
  const { id } = req.params;
  try {
    if (!req.isAdmin) {
      return res
        .status(403)
        .json(
          errorResponse(
            'You are not authorized to access this Application.',
            403
          )
        );
    }
    const { error } = validate(req.body, false);
    if (error)
      return res
        .status(400)
        .json(validationError(error, error.details[0].message));
    const result = await Application.findByIdAndUpdate(
      id,
      { ...req.body, adminId: req.userId },
      {
        new: true,
      }
    );
    if (!result)
      return res
        .status(404)
        .json(errorResponse(`Application with id ${id} does not exist.`, 404));

    return res
      .status(200)
      .json(success(result, 'Application updated successfully.'));
  } catch (error) {
    if (error instanceof mongoose.CastError)
      return res
        .status(400)
        .json(errorResponse(`Invalid Application Id: ${id}`, 400));
    debug(`Error in updateAppById: ${error}`);
    return res
      .status(500)
      .json(
        errorResponse(
          'Internal Server Error! failed to update the Application by Id.'
        )
      );
  }
};

exports.deleteAppById = async (req, res) => {
  const { id } = req.params;
  try {
    if (!req.isAdmin) {
      return res
        .status(403)
        .json(
          errorResponse(
            'You are not authorized to access this Application.',
            403
          )
        );
    }
    const result = await Application.findByIdAndDelete(id);
    if (!result)
      return res
        .status(404)
        .json(errorResponse(`Application with id ${id} does not exist.`, 404));
    return res
      .status(200)
      .json(success(result, 'Application deleted successfully.'));
  } catch (error) {
    if (error instanceof mongoose.CastError)
      return res
        .status(400)
        .json(errorResponse(`Invalid Application Id: ${id}`, 400));
    debug(`Error in deleteAppById: ${error}`);
    return res
      .status(500)
      .json(
        errorResponse(
          'Internal Server Error! failed to delete the Application by Id.'
        )
      );
  }
};

exports.getApps = async (req, res) => {
  try {
    if (!req.isAdmin) {
      return res
        .status(403)
        .json(
          errorResponse(
            'You are not authorized to access this Application.',
            403
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
        $lt: new Date(+req.query.before), // + for converting it to number
      };
    }

    if (req.query.after) {
      delete queries.after;
      queries.createdAt = {
        ...queries.createdAt,
        $gt: new Date(+req.query.after),
      };
    }

    const sortDirection = req.query.status === 'pending' ? 1 : -1;

    const result = await Application.find(queries, { __v: 0 })
      .sort({ createdAt: sortDirection })
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
      .json(success(result, `Found ${result.length} matching application(s).`));
  } catch (error) {
    debug(`Error in getApps: ${error}`);
    return res
      .status(500)
      .json(
        errorResponse(
          'Internal Server Error! failed to fetch the Applications.'
        )
      );
  }
};
