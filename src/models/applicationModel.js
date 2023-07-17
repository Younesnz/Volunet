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
        required: true,
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

const validateApplication = (application, isRequired = true) => {
    let joiSchema = Joi.object({
        message: Joi.string().max(500),
        status: Joi.string().valid('pending', 'accepted', 'rejected'),
        eventId: Joi.objectId(),
        userId: Joi.objectId(),
        adminId: Joi.objectId(),

        // these 2 are for filtering
        after: Joi.date().timestamp('unix'),
        before: Joi.date().timestamp('unix'),
    });

    if (isRequired)
        joiSchema = joiSchema.fork(['eventId', 'userId'], (item) =>
            item.required()
        );

    return joiSchema.validate(application);
};

exports.Application = Application;
exports.validate = validateApplication;
