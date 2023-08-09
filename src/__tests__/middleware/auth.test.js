const jwt = require('jsonwebtoken');
const { authenticate, adminOnly } = require('../../middleware/auth');
const User = require('../../models/userModel');

jest.mock('jsonwebtoken');
jest.mock('../../models/userModel');

describe('Authentication Middleware', () => {
  describe('authenticate', () => {
    it('should call next if authentication is successful', async () => {
      const req = {
        header: jest.fn().mockReturnValue('Bearer token'),
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      jwt.verify.mockReturnValue({
        id: 'someUserId',
        iat: Math.floor(Date.now() / 1000),
      });
      User.findOne.mockResolvedValue({ _id: 'someUserId', role: 'user' });

      await authenticate(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return an error if token is missing', async () => {
      const req = {
        header: jest.fn().mockReturnValue(null),
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('adminOnly', () => {
    it('should call next if user is admin', async () => {
      const req = { isAdmin: true };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await adminOnly(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return an error if user is not admin', async () => {
      const req = { isAdmin: false };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await adminOnly(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalled();
    });
  });
});
