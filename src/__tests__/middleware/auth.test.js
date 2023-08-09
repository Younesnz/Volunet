const httpMocks = require('node-mocks-http');
const jwt = require('jsonwebtoken');
const { authenticate, adminOnly } = require('../../middleware/auth');
const User = require('../../models/userModel');
require('dotenv').config();

describe('Authentication Middleware', () => {
  describe('authenticate', () => {
    it('should call next if authentication is successful', async () => {
      const user = new User({ _id: 'someUserId', role: 'user' });
      jest.spyOn(User, 'findOne').mockResolvedValueOnce(user);
      const token = jwt.sign(
        { id: 'someUserId', iat: Math.floor(Date.now() / 1000) },
        process.env.JWT_SECRET
      );

      const req = httpMocks.createRequest({
        headers: { Authorization: token },
      });
      const res = httpMocks.createResponse();
      const next = jest.fn();

      await authenticate(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should return unauthorized if token is not provided', async () => {
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();
      const next = jest.fn();

      await authenticate(req, res, next);
      expect(res.statusCode).toBe(401);
    });
  });

  describe('adminOnly', () => {
    it('should call next if user is admin', async () => {
      const req = httpMocks.createRequest({ isAdmin: true });
      const res = httpMocks.createResponse();
      const next = jest.fn();

      await adminOnly(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should return forbidden if user is not admin', async () => {
      const req = httpMocks.createRequest({ isAdmin: false });
      const res = httpMocks.createResponse();
      const next = jest.fn();

      await adminOnly(req, res, next);
      expect(res.statusCode).toBe(403);
    });
  });
});
