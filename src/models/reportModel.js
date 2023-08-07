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
    type: String,
    minlength: 5,
    maxlength: 500,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now(),
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

// This is to prevent user to set the createdAt to a value other than current time
reportSchema.pre('save', (next) => {
  if (this.isNew && this.createdAt) this.createdAt = Date.now();
  next();
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
    status: Joi.string().valid('pending', 'accepted', 'rejected'),
    userId: Joi.objectId(),
    adminId: Joi.objectId(),
    eventId: Joi.objectId(),

    // these 2 are for filtering
    after: Joi.date().iso(),
    before: Joi.date().iso(),
  });

  if (isRequired)
    joiSchema = joiSchema.fork(['message', 'userId', 'eventId'], (item) =>
      item.required()
    );
  return joiSchema.validate(report);
};

exports.Report = Report;
exports.validate = validateReport;
