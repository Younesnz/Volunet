const mongoose = require('mongoose');
const { Report } = require('../../models/reportModel');
require('dotenv').config();

describe('Report Model', () => {
  describe('Validation', () => {
    it('should validate a proper report', () => {
      const report = new Report({
        category: 'scam',
        message: 'This event seems suspicious',
        userId: new mongoose.Types.ObjectId(),
        eventId: new mongoose.Types.ObjectId(),
      });

      const validation = report.validateSync();
      expect(validation).toBeUndefined();
    });

    it('should require certain fields', () => {
      const report = new Report();
      const validation = report.validateSync();
      expect(validation.errors.message).toBeDefined();
      expect(validation.errors.userId).toBeDefined();
      expect(validation.errors.eventId).toBeDefined();
    });

    it('should enforce correct category', () => {
      const report = new Report({
        category: 'invalid-category',
        message: 'This event seems suspicious',
        userId: new mongoose.Types.ObjectId(),
        eventId: new mongoose.Types.ObjectId(),
      });

      const validation = report.validateSync();
      expect(validation.errors.category).toBeDefined();
    });

    it('should enforce correct status', () => {
      const report = new Report({
        category: 'scam',
        message: 'This event seems suspicious',
        status: 'invalid-status',
        userId: new mongoose.Types.ObjectId(),
        eventId: new mongoose.Types.ObjectId(),
      });

      const validation = report.validateSync();
      expect(validation.errors.status).toBeDefined();
    });

    // Additional validation tests can go here
  });

  // Other behavior tests can go here
});
