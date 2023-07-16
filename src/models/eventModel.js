const mongoose = require('mongoose');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const commentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    maxlength: 120,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const locationSchema = new mongoose.Schema({
  point: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number], // two items, first longitude, and second latitude
      required: true,
    },
  },
  country: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
});

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    minlength: 5,
    maxlength: 50,
    required: true,
  },
  description: {
    type: String,
    minlength: 10,
    maxlength: 1000,
    required: true,
  },
  category: {
    type: String,
    enum: [
      'education',
      'environment',
      'health',
      'animals',
      'arts',
      'sports',
      'tech',
      'community',
      'workshop',
      'charity',
      'other',
    ],
    default: 'other',
  },
  type: {
    type: String,
    enum: ['online', 'physical', 'both'],
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  pictures: {
    type: [String],
  },
  likes: {
    // TODO: Add like and dislike routes.
    type: Number,
    default: 0,
  },
  rating: {
    // TODO: Add rating routes
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  location: {
    // TODO add pre save for handling location
    type: locationSchema,
    required: !(this.type === 'online'), // TODO: test this
  },
  comments: {
    type: commentSchema,
  },
  organizerId: {
    // will be set by Auth
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  applicationId: {
    // Will be set by code (not from user)
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true,
  },
  // registeredUsers: {
  //     type: [mongoose.Schema.Types.ObjectId],
  //     ref: 'User',
  //     required: true
  // },
});

eventSchema.pre('save', function (next) {
  // Transform date from timestamp to Date object
  if (this.date instanceof Date === false) {
    this.date = new Date(this.date);
  }

  // Transform location fields into locationSchema
  if (this.type !== 'online') {
    this.location = {
      point: {
        type: 'Point',
        coordinates: [this.lon, this.lat],
      },
      country: this.country,
      city: this.city,
    };
  }

  next();
});

eventSchema.pre('findOneAndUpdate', function (next) {
  const updateData = this.getUpdate();
  const { lon, lat, country, city, date } = updateData;

  if (date instanceof Date === false && typeof date === 'number') {
    updateData.date = new Date(date);
  }

  if (lon && lat && country && city && updateData.type !== 'online') {
    updateData.location = {
      point: {
        type: 'Point',
        coordinates: [lon, lat],
      },
      country,
      city,
    };
  }

  next();
});

const Event = mongoose.model('Event', eventSchema);

const validateEvent = (event, isRequired = true) => {
  let joiSchema = Joi.object({
    title: Joi.string().min(5).max(50),
    description: Joi.string().min(10).max(1000),
    category: Joi.string().valid(
      'education',
      'environment',
      'health',
      'animals',
      'arts',
      'sports',
      'tech',
      'community',
      'workshop',
      'charity',
      'other'
    ),
    type: Joi.string().valid('online', 'physical', 'both'),
    date: Joi.date().timestamp(), // all dates are recieving as timestamp for consistancy
    pictures: Joi.array().items(Joi.string()),
    organizerId: Joi.objectId(), // TODO: delete this after testing. it shouldn't be allowed
    // for location:
    country: Joi.string().max(50),
    city: Joi.string().max(50),
    lon: Joi.number().min(-180).max(180),
    lat: Joi.number().min(-90).max(90),
  });

  if (isRequired) {
    joiSchema = joiSchema.fork(
      ['title', 'description', 'type', 'date', 'organizerId'],
      (item) => item.required()
    );
    if (event.type && event.type !== 'online')
      joiSchema = joiSchema.fork(['country', 'city', 'lon', 'lat'], (item) =>
        item.required()
      );
  }

  return joiSchema.validate(event);
};

const validateEventQuery = (query) => {
  const joiSchema = Joi.object({
    title: Joi.string().min(4).max(50),
    category: Joi.string().valid(
      'education',
      'environment',
      'health',
      'animals',
      'arts',
      'sports',
      'tech',
      'community',
      'workshop',
      'charity',
      'other'
    ),
    type: Joi.string().valid('online', 'physical', 'both'),
    createdBefore: Joi.date().timestamp(),
    createdAfter: Joi.date().timestamp(),
    startsBefore: Joi.date().timestamp(),
    startsAfter: Joi.date().timestamp(),
    country: Joi.string().max(50),
    city: Joi.string().max(50),
    near: Joi.object().keys({
      lon: Joi.number().min(-180).max(180),
      lat: Joi.number().min(-90).max(90),
    }),
    orderBy: Joi.string().valid('time', 'likes', 'rating'),
    limit: Joi.number().min(1).max(100),
  });

  return joiSchema.validate(query);
};

exports.Event = Event;
exports.validate = validateEvent;
exports.validateQuery = validateEventQuery;

// TODO: add registered users (route)
// TODO: add rated users (route)
