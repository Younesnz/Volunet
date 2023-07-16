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
        // TODO add comment routes
        type: commentSchema,
    },
    organizerId: {
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
        organizerId: Joi.objectId(),
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
                ['country', 'city', 'lon', 'lat'],
                (item) => item.required()
            );
    }

    return joiSchema.validate(event);
};

exports.Event = Event;
exports.validate = validateEvent;
