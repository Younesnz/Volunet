const mongoose = require('mongoose');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const applicationSchema = new mongoose.Schema({
  message: {
    type: String,
    maxlength: 500,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  //   updatedAt: {
  //     type: Date,
  //   },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    //  required: true, // it causes error while making events
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
  },
});

const Application = mongoose.model('Application', applicationSchema);

const validateApplication = (application) => {
  const joiSchema = Joi.object({
    message: Joi.string().max(500),
    status: Joi.string().valid('pending', 'accepted', 'rejected'),
  })
    .min(1)
    .message('at least 1 field in the request body is required.');
  return joiSchema.validate(application);
};

const validateApplicationQuery = (application) => {
  const joiSchema = Joi.object({
    status: Joi.string().valid('pending', 'accepted', 'rejected'),
    eventId: Joi.objectId(),
    userId: Joi.objectId(),
    adminId: Joi.objectId(),
    after: Joi.date().iso(),
    before: Joi.date().iso(),
  });
  return joiSchema.validate(application);
};

exports.Application = Application;
exports.validate = validateApplication;
exports.validateQuery = validateApplicationQuery;
