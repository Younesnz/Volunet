const mongoose = require('mongoose');
const { Application, validate } = require('../../models/applicationModel');
require('dotenv').config();

describe('Application Model', () => {
  describe('Validation', () => {
    it('should validate a proper application', async () => {
      const application = new Application({
        message: 'Sample application message',
        status: 'pending',
        eventId: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId(),
      });

      try {
        await application.validate();
      } catch (error) {
        // Validation errors should not be thrown
        expect(error).toBeUndefined();
      }
    });

    // it('should require certain fields', async () => {
    //   const application = new Application();
    //   let error = null;

    //   try {
    //     await application.validate();
    //   } catch (validationError) {
    //     error = validationError;
    //   }

    //   expect(error).toBeDefined();
    //   expect(error.errors).toBeDefined();
    //   expect(error.errors.message).toBeDefined();
    //   expect(error.errors.status).toBeDefined();
    //   expect(error.errors.userId).toBeDefined();
    // });

    it('should enforce correct status', async () => {
      const application = new Application({
        message: 'Sample application message',
        status: 'invalid-status',
        eventId: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId(),
      });

      let error = null;

      try {
        await application.validate();
      } catch (validationError) {
        error = validationError;
      }

      expect(error).toBeDefined();
      expect(error.errors).toBeDefined();
      expect(error.errors.status).toBeDefined();
    });

    it('should enforce valid userId', async () => {
      const application = new Application({
        message: 'Sample application message',
        status: 'pending',
        eventId: new mongoose.Types.ObjectId(),
        userId: 'invalid-userId', // Invalid userId format
      });

      let error = null;

      try {
        await application.validate();
      } catch (validationError) {
        error = validationError;
      }

      expect(error).toBeDefined();
      expect(error.errors).toBeDefined();
      expect(error.errors.userId).toBeDefined();
    });

    // Add more tests for other fields and validations as needed
  });

  // Other behavior tests can go here
});
