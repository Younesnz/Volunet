const mongoose = require('mongoose');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const commentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    maxlength: 200,
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
    lowercase: true,
    trim: true,
    required: true,
  },
  city: {
    type: String,
    lowercase: true,
    trim: true,
    required: true,
  },
  address: {
    type: String,
    minlength: 5,
    maxlength: 100,
    required: true,
  },
});

// const sponsorSchema = new mongoose.Schema({
//   logo: {
//     type: String,
//     required: true,
//   },
//   name: {
//     type: String,
//     maxlength: 50,
//     required: true,
//   },
//   link: {
//     type: String,
//     match: [
//       /^(ftp|http|https):\/\/[^ "]+$/,
//       'Please provide a valid website address.',
//     ],
//   },
// });

const contactSchema = new mongoose.Schema({
  phone: {
    type: String,
    match: [/^\+?[0-9]{5,20}$/, 'Please provide a valid phone number.'],
  },
  email: {
    type: String,
    match: [
      /^([\w-.]+@([\w-]+\.)+[\w-]{2,4})?$/,
      'Please provide a valid email',
    ],
  },
  website: {
    type: String,
    match: [
      /^(ftp|http|https):\/\/[^ "]+$/,
      'Please provide a valid website address.',
    ],
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
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  ratingCount: {
    type: Number,
    min: 0,
    default: 0,
  },
  registeredCount: {
    type: Number,
    min: 0,
    default: 0,
  },
  location: {
    type: locationSchema,
  },
  contact: {
    type: contactSchema,
  },
  comments: {
    type: [commentSchema],
  },
  // sponsors: {
  //   type: [sponsorSchema],
  // },
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
  // registeredUsers: { // this will be implemented in user schema.
  //     type: [mongoose.Schema.Types.ObjectId],
  //     ref: 'User',
  //     required: true
  // },
});

eventSchema.virtual('contactPhone').set(function (phone) {
  this.contact = this.contact || {};
  this.contact.phone = phone;
});
eventSchema.virtual('contactEmail').set(function (email) {
  this.contact = this.contact || {};
  this.contact.email = email;
});
eventSchema.virtual('contactWebsite').set(function (website) {
  this.contact = this.contact || {};
  this.contact.website = website;
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
    date: Joi.date().iso(),
    pictures: Joi.array().items(Joi.string().uri()),

    address: Joi.string().min(5).max(100),

    contactPhone: Joi.string()
      .regex(/^[0-9]{5,20}$/)
      .messages({
        'string.pattern.base': `Phone number is not valid.`,
      }),
    contactEmail: Joi.string().email(),
    contactWebsite: Joi.string().uri(),
    // for location:
    country: Joi.string().max(50),
    city: Joi.string().max(50),
    lon: Joi.number().min(-180).max(180),
    lat: Joi.number().min(-90).max(90),
  })
    .min(1)
    .message('at least on field is required.');

  if (isRequired) {
    joiSchema = joiSchema.fork(
      ['title', 'description', 'type', 'date'],
      (item) => item.required()
    );
    if (event.type && event.type !== 'online')
      joiSchema = joiSchema.fork(
        ['country', 'city', 'lon', 'lat', 'address'],
        (item) => item.required()
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
    createdBefore: Joi.date().iso(),
    createdAfter: Joi.date().iso(),
    startsBefore: Joi.date().iso(),
    startsAfter: Joi.date().iso(),
    country: Joi.string().max(50),
    city: Joi.string().max(50),
    near: Joi.array().length(2).items(
      Joi.number().min(-180).max(180).required(), // longitude
      Joi.number().min(-90).max(90).required() // latitude
    ),
    orderBy: Joi.string().valid('time', 'likes', 'rating'),
    limit: Joi.number().min(1).max(100),
  });

  return joiSchema.validate(query);
};

// const validateComment = (comment) => {
//   const joiSchema = Joi.object({
//     text: Joi.string().min(1).max(200).required(),
//   });
//   return joiSchema.validate(comment);
// };

exports.Event = Event;
exports.validate = validateEvent;
exports.validateQuery = validateEventQuery;
// exports.validateComment = validateComment;
