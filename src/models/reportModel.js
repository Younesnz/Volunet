const mongoose = require('mongoose');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const reportSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['other', 'scam', 'suspicious', 'safety', 'copyright', 'unethical'],
    default: 'other',
  },
  message: {
    tyep: String,
    minLength: 5,
    maxLength: 500,
    required: true,
  },
  action: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
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
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
});

const Report = mongoose.model('Report', reportSchema);

const validateReport = (report, isRequired = true) => {
  let joiSchema = Joi.object({
    category: Joi.string().valid(
      'other',
      'scam',
      'suspicious',
      'safety',
      'copyright',
      'unethical'
    ),
    message: Joi.string().min(5).max(500),
    action: Joi.string().valid('pending', 'accepted', 'rejected'),
    userId: Joi.objectId(),
    adminId: Joi.objectId(),
    eventId: Joi.objectId(),
  });

  if (isRequired)
    joiSchema = joiSchema.fork(
      ['message', 'userId', 'adminId', 'eventId'],
      (item) => item.required()
    );
  return joiSchema.validate(report);
};

exports.Report = Report;
exports.validate = validateReport;
