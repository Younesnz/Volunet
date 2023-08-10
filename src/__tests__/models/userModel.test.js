const User = require('../../models/userModel');

describe('User Model', () => {
  // Validation tests
  it('should validate required fields', () => {
    const user = new User();
    const error = user.validateSync();
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

  it('should validate email format', () => {
    const user = new User({
      username: 'testuser',
      email: 'invalid-email',
      password: 'testPassword',
      location: { country: 'test', city: 'test' },
    });
    const error = user.validateSync();

    expect(error).toBeDefined();
    expect(error.errors.email).toBeDefined();
    expect(error.errors.email.message).toMatch(/valid email/);
  });
});
