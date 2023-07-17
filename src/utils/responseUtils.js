module.exports = {
    success: (data, message = 'Success') => ({
        success: true,
        data,
        message,
    }),

    errorResponse: (message = 'Internal Server Error', status = 500) => ({
        success: false,
        error: {
            message,
            status,
        },
    }),

    validationError: (errors, message = '', status = 400) => ({
        success: false,
        error: {
            message: `Validation Error: ${message}`,
            status,
            errors,
        },
    }),
};
