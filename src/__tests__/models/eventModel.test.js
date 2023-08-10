const mongoose = require('mongoose');
const { Event } = require('../../models/eventModel');
require('dotenv').config();

describe('Event Model', () => {
  describe('Validation', () => {
    it('should require title', () => {
      const event = new Event();
      const validation = event.validateSync();
      expect(validation.errors.title).toBeDefined();
    });

    it('should require description', () => {
      const event = new Event();
      const validation = event.validateSync();
      expect(validation.errors.description).toBeDefined();
    });

    // it('should require category', () => {
    //   const event = new Event();
    //   const validation = event.validateSync();
    //   expect(validation.errors.category).toBeDefined();
    // });

    it('should require type', () => {
      const event = new Event();
      const validation = event.validateSync();
      expect(validation.errors.type).toBeDefined();
    });

    it('should require date', () => {
      const event = new Event();
      const validation = event.validateSync();
      expect(validation.errors.date).toBeDefined();
    });

    // it('should require location coordinates', () => {
    //   const event = new Event();
    //   const validation = event.validateSync();
    //   expect(validation.errors['location.point.coordinates']).toBeDefined();
    // });

    it('should require organizerId', () => {
      const event = new Event();
      const validation = event.validateSync();
      expect(validation.errors.organizerId).toBeDefined();
    });

    it('should require applicationId', () => {
      const event = new Event();
      const validation = event.validateSync();
      expect(validation.errors.applicationId).toBeDefined();
    });

    it('should enforce valid category', () => {
      const event = new Event({
        title: 'Sample Event',
        description: 'This is a sample event description.',
        category: 'invalid-category',
        type: 'physical',
        date: new Date(),
        location: {
          point: {
            type: 'Point',
            coordinates: [0, 0],
          },
          country: 'Sample Country',
          city: 'Sample City',
          address: '123 Sample Street',
        },
        organizerId: new mongoose.Types.ObjectId(),
        applicationId: new mongoose.Types.ObjectId(),
      });

      const validation = event.validateSync();
      expect(validation.errors.category).toBeDefined();
    });

    it('should enforce valid type', () => {
      const event = new Event({
        title: 'Sample Event',
        description: 'This is a sample event description.',
        category: 'education',
        type: 'invalid-type',
        date: new Date(),
        location: {
          point: {
            type: 'Point',
            coordinates: [0, 0],
          },
          country: 'Sample Country',
          city: 'Sample City',
          address: '123 Sample Street',
        },
        organizerId: new mongoose.Types.ObjectId(),
        applicationId: new mongoose.Types.ObjectId(),
      });

      const validation = event.validateSync();
      expect(validation.errors.type).toBeDefined();
    });

    // it('should enforce valid coordinates for location', () => {
    //   const event = new Event({
    //     title: 'Sample Event',
    //     description: 'This is a sample event description.',
    //     category: 'education',
    //     type: 'physical',
    //     date: new Date(),
    //     location: {
    //       point: {
    //         type: 'Point',
    //         coordinates: [200, 100], // Invalid coordinates
    //       },
    //       country: 'Sample Country',
    //       city: 'Sample City',
    //       address: '123 Sample Street',
    //     },
    //     organizerId: new mongoose.Types.ObjectId(),
    //     applicationId: new mongoose.Types.ObjectId(),
    //   });

    //   const validation = event.validateSync();
    //   expect(validation.errors.location).toBeDefined();
    // });

    it('should enforce valid email format in contact', () => {
      const event = new Event({
        title: 'Sample Event',
        description: 'This is a sample event description.',
        category: 'education',
        type: 'physical',
        date: new Date(),
        location: {
          point: {
            type: 'Point',
            coordinates: [0, 0],
          },
          country: 'Sample Country',
          city: 'Sample City',
          address: '123 Sample Street',
        },
        contact: {
          email: 'invalid-email', // Invalid email format
        },
        organizerId: new mongoose.Types.ObjectId(),
        applicationId: new mongoose.Types.ObjectId(),
      });

      const validation = event.validateSync();
      expect(validation.errors['contact.email']).toBeDefined();
    });

    describe('Virtuals', () => {
      it('should set contact phone correctly using virtual', () => {
        const event = new Event({
          title: 'Sample Event',
          description: 'This is a sample event description.',
          category: 'education',
          type: 'physical',
          date: new Date(),
          location: {
            point: {
              type: 'Point',
              coordinates: [0, 0],
            },
            country: 'Sample Country',
            city: 'Sample City',
            address: '123 Sample Street',
          },
          organizerId: new mongoose.Types.ObjectId(),
          applicationId: new mongoose.Types.ObjectId(),
        });

        event.contactPhone = '1234567890';
        expect(event.contact.phone).toBe('1234567890');
      });
    });
  });
});
