export const prisma = {
  refreshToken: {
    create: jest.fn().mockResolvedValue({
      id: 'mock-id',
      token_identifier: 'mocked_token',
      user_id: 'mock-user-id',
      is_valid: true,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
      created_at: new Date(),
      issued_by_ip: '127.0.0.1',
      user_agent: 'test-agent'
    }),
    findUnique: jest.fn().mockResolvedValue({
      id: 'mock-id',
      token_identifier: 'mocked_token',
      user_id: 'mock-user-id',
      is_valid: true,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
      created_at: new Date(),
      issued_by_ip: '127.0.0.1',
      user_agent: 'test-agent'
    }),
    findFirst: jest.fn().mockResolvedValue({
      id: 'mock-id',
      token: 'mocked_token',
      userId: 'mock-user-id',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    }),
    update: jest.fn().mockResolvedValue({
      id: 'mock-id',
      token_identifier: 'mocked_token',
      user_id: 'mock-user-id',
      is_valid: false,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
      created_at: new Date(),
      issued_by_ip: '127.0.0.1',
      user_agent: 'test-agent'
    }),
    delete: jest.fn().mockResolvedValue({
      id: 'mock-id',
      token: 'mocked_token',
      userId: 'mock-user-id',
      expiresAt: new Date(),
      createdAt: new Date(),
    }),
  },
  user: {
    findUnique: jest.fn().mockResolvedValue({
      id: 'mock-user-id',
      email: 'test@example.com',
      password: 'hashedPassword',
      username: 'testuser',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: new Date(),
      isActive: true,
      isAdmin: false,
    }),
  },
};

export default prisma; 