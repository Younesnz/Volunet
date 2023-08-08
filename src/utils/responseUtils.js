module.exports = {
  success: (data, message = 'Success') => ({
    success: true,
    data,
    message,
  }),

  errorResponse: (
    message = 'Internal Server Error',
    status = 500,
    type = 'server'
  ) => ({
    success: false,
    error: {
      type,
      message,
      status,
    },
  }),

  validationError: (errors, message = '', status = 400) => ({
    success: false,
    error: {
      type: 'validation',
      message,
      status,
      errors,
    },
  }),
};
