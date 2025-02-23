import { generateTokens, verifyToken, invalidateRefreshToken, renewTokens, assignToken } from './login';
import jwt from 'jsonwebtoken';

// Mock environment variables
process.env.JWT_SECRET = 'test-secret';

// Mock the entire prisma module
jest.mock('../prisma');

// Mock jwt
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mocked_token'),
  verify: jest.fn().mockImplementation(() => ({
    id: 'mock-user-id'
  })),
}));

describe('Login', () => {
  const mockUser = { 
    id: 'mock-user-id', 
    email: 'test@test.com', 
    username: 'test', 
    password: 'test', 
    createdAt: new Date(), 
    updatedAt: new Date(), 
    lastLogin: new Date(), 
    isActive: true, 
    isAdmin: false 
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('assignToken', () => {
    it('should generate an access token', () => {
      const token = assignToken(mockUser);
      expect(token).toBe('mocked_token');
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: mockUser.id },
        'test-secret',
        { expiresIn: 15 * 60 * 1000 }
      );
    });
  });

  describe('generateTokens', () => {
    it('should generate both tokens successfully', async () => {
      const tokens = await generateTokens(mockUser, "127.0.0.1", "test");
      expect(tokens).toEqual({
        accessToken: 'mocked_token',
        refreshToken: 'mocked_token',
      });
    });

    it('should throw error if refresh token creation fails', async () => {
      const { prisma } = require('../prisma');
      prisma.refreshToken.create.mockRejectedValueOnce(new Error('Database error'));

      await expect(generateTokens(mockUser, "127.0.0.1", "test"))
        .rejects
        .toThrow('Failed to generate tokens: Database error');
    });

    it('should throw error if refresh token record is not created', async () => {
      const { prisma } = require('../prisma');
      prisma.refreshToken.create.mockResolvedValueOnce(null);

      await expect(generateTokens(mockUser, "127.0.0.1", "test"))
        .rejects
        .toThrow('Failed to generate tokens: Failed to create refresh token record');
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', async () => {
      const token = 'mocked_token';
      const { prisma } = require('../prisma');

      prisma.refreshToken.findUnique.mockResolvedValueOnce({
        id: 'mock-id',
        token_identifier: token,
        user_id: 'mock-user-id',
        is_valid: true,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        created_at: new Date(),
        issued_by_ip: '127.0.0.1',
        user_agent: 'test-agent'
      });

      const result = await verifyToken(token);
      expect(result).toEqual({ id: 'mock-user-id' });
    });

    it('should throw error if token not found', async () => {
      const { prisma } = require('../prisma');
      prisma.refreshToken.findUnique.mockResolvedValueOnce(null);

      await expect(verifyToken('invalid_token'))
        .rejects
        .toThrow('Failed to verify token: Refresh token not found');
    });

    it('should throw error if token is invalid', async () => {
      const { prisma } = require('../prisma');
      prisma.refreshToken.findUnique.mockResolvedValueOnce({
        is_valid: false,
        expires_at: new Date(Date.now() + 1000),
      });

      await expect(verifyToken('invalid_token'))
        .rejects
        .toThrow('Failed to verify token: Refresh token is not valid');
    });

    it('should throw error if token is expired', async () => {
      const { prisma } = require('../prisma');
      prisma.refreshToken.findUnique.mockResolvedValueOnce({
        is_valid: true,
        expires_at: new Date(Date.now() - 1000),
      });

      await expect(verifyToken('expired_token'))
        .rejects
        .toThrow('Failed to verify token: Refresh token has expired');
    });

    it('should throw error if JWT verification fails', async () => {
      const { prisma } = require('../prisma');
      const jwt = require('jsonwebtoken');
      
      prisma.refreshToken.findUnique.mockResolvedValueOnce({
        id: 'mock-id',
        token_identifier: 'mocked_token',
        user_id: 'mock-user-id',
        is_valid: true,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        created_at: new Date(),
        issued_by_ip: '127.0.0.1',
        user_agent: 'test-agent'
      });

      jwt.verify.mockImplementationOnce(() => {
        throw new Error('Invalid signature');
      });

      await expect(verifyToken('mocked_token'))
        .rejects
        .toThrow('Failed to verify token: Invalid signature');
    });
  });

  describe('renewTokens', () => {
    it('should renew tokens for valid refresh token', async () => {
      const { prisma } = require('../prisma');
      
      prisma.refreshToken.findUnique.mockResolvedValueOnce({
        id: 'mock-id',
        token_identifier: 'mocked_token',
        user_id: 'mock-user-id',
        is_valid: true,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        created_at: new Date(),
        issued_by_ip: '127.0.0.1',
        user_agent: 'test-agent'
      });

      prisma.user.findUnique.mockResolvedValueOnce(mockUser);

      const result = await renewTokens('mocked_token', '127.0.0.1', 'test');
      expect(result).toEqual({
        accessToken: 'mocked_token',
        refreshToken: 'mocked_token',
      });
    });

    it('should throw error if user not found', async () => {
      const { prisma } = require('../prisma');
      
      prisma.refreshToken.findUnique.mockResolvedValueOnce({
        is_valid: true,
        expires_at: new Date(Date.now() + 1000),
      });

      prisma.user.findUnique.mockResolvedValueOnce(null);

      await expect(renewTokens('mocked_token', '127.0.0.1', 'test'))
        .rejects
        .toThrow('User not found');
    });

    it('should throw error if token verification fails', async () => {
      const { prisma } = require('../prisma');
      
      prisma.refreshToken.findUnique.mockResolvedValueOnce(null);

      await expect(renewTokens('invalid_token', '127.0.0.1', 'test'))
        .rejects
        .toThrow('Failed to verify token: Refresh token not found');
    });

    it('should throw error if token generation fails', async () => {
      const { prisma } = require('../prisma');
      
      prisma.refreshToken.findUnique.mockResolvedValueOnce({
        id: 'mock-id',
        token_identifier: 'mocked_token',
        user_id: 'mock-user-id',
        is_valid: true,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        created_at: new Date(),
        issued_by_ip: '127.0.0.1',
        user_agent: 'test-agent'
      });

      prisma.user.findUnique.mockResolvedValueOnce(mockUser);
      prisma.refreshToken.create.mockRejectedValueOnce(new Error('Database error'));

      await expect(renewTokens('mocked_token', '127.0.0.1', 'test'))
        .rejects
        .toThrow('Failed to generate tokens: Database error');
    });
  });

  describe('invalidateRefreshToken', () => {
    it('should invalidate a refresh token', async () => {
      const token = 'mocked_token';
      const { prisma } = require('../prisma');

      await invalidateRefreshToken(token);
      
      expect(prisma.refreshToken.update).toHaveBeenCalledWith({
        where: { token_identifier: token },
        data: { is_valid: false }
      });
    });

    it('should handle errors when invalidating token', async () => {
      const { prisma } = require('../prisma');
      prisma.refreshToken.update.mockRejectedValueOnce(new Error('Database error'));

      await expect(invalidateRefreshToken('mocked_token'))
        .rejects
        .toThrow('Database error');
    });
  });
});