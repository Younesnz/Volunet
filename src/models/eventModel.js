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
    required: true,
  },
  city: {
    type: String,
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
    required: !(this.type === 'online'), // TODO: test this
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
      address: this.address,
    };
  }

  if (this.contactPhone) this.contact.phone = this.contactPhone;
  if (this.contactEmail) this.contact.email = this.contactEmail;
  if (this.contactWebsite) this.contact.website = this.contactWebsite;

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

  // Parse and update the contact fields if they exist in the updateData
  if (updateData.contactPhone)
    updateData.contact.phone = updateData.contactPhone;
  if (updateData.contactEmail)
    updateData.contact.email = updateData.contactEmail;
  if (updateData.contactWebsite)
    updateData.contact.website = updateData.contactWebsite;
  delete updateData.contactPhone;
  delete updateData.contactEmail;
  delete updateData.contactWebsite;

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

    address: Joi.string().min(5).max(100),

    // sponsors: Joi.array().items(
    //   Joi.object().keys({
    //     name: Joi.string().max(50),
    //     link: Joi.string().uri(),
    //     logo: Joi.string().uri(),
    //   })
    // ),

    contactPhone: Joi.string()
      .regex(/^[0-9]{5,20}$/)
      .messages({
        'string.pattern.base': `Phone number is not valid.`,
      }),
    contactEmail: Joi.string().email(),
    contactWebsite: Joi.string().uri(),

    // contact: Joi.object().keys({
    //   phone: Joi.string()
    //     .regex(/^[0-9]{5,20}$/)
    //     .messages({
    //       'string.pattern.base': `Phone number is not valid.`,
    //     }),
    //   email: Joi.string().email(),
    //   website: Joi.string().uri(),
    // }),

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

const validateComment = (comment) => {
  const joiSchema = Joi.object({
    text: Joi.string().min(1).max(200).required(),
    userId: Joi.objectId().required(),
  });
  return joiSchema.validate(comment);
};

exports.Event = Event;
exports.validate = validateEvent;
exports.validateQuery = validateEventQuery;
exports.validateComment = validateComment;

// TODO: add registered users (route)
// TODO: add rated users (route)
