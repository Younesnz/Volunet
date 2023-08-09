const mongoose = require('mongoose');
const User = require('../../models/userModel');
require('dotenv').config();

describe('User Model', () => {
  beforeAll(async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  });

  beforeEach(async () => {
    await User.deleteMany({}); // Clears the User collection before each test
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  // Validation tests
  it('should validate required fields', async () => {
    const user = new User();
    let error;
    try {
      await user.validate();
    } catch (e) {
      error = e;
    }
    expect(error.errors.username).toBeDefined();
    expect(error.errors.password).toBeDefined();
    expect(error.errors.email).toBeDefined();
    expect(error.errors.location).toBeDefined();
  });

  it('should have default values', () => {
    const user = new User();
    expect(user.isVerified).toBe(false);
    expect(user.role).toBe('user');
  });

  it('should enforce unique constraints for username and email', async () => {
    const user1 = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'testPassword',
      location: { country: 'test', city: 'test' },
    });
    await user1.save();
    let error;
    try {
      const user2 = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'testPassword',
        location: { country: 'test', city: 'test' },
      });
      await user2.save();
    } catch (e) {
      error = e;
    }
    expect(error).toBeDefined();
  });

  it('should validate email format', async () => {
    const user = new User({
      username: 'testuser',
      email: 'invalid-email',
      password: 'testPassword',
      location: { country: 'test', city: 'test' },
    });
    let error;
    try {
      await user.validate(); // Notice the change to asynchronous validation
    } catch (e) {
      error = e;
    }

    if (!error) {
      console.log('No validation error thrown');
      console.log('User:', user);
    }

    expect(error).toBeDefined();
    expect(error.errors.email).toBeDefined();
    expect(error.errors.email.message).toMatch(/valid email/);
  });
});
