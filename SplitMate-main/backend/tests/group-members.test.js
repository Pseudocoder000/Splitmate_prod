const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const User = require('../src/models/User');
const RefreshToken = require('../src/models/RefreshToken');

jest.setTimeout(60000);

describe('Group member creation', () => {
  let memoryServer;

  beforeAll(async () => {
    memoryServer = await MongoMemoryServer.create();
    await mongoose.connect(memoryServer.getUri());
    await User.deleteMany({});
    await RefreshToken.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await memoryServer.stop();
  });

  it('creates a group and adds an existing user by email on creation', async () => {
    await request(app).post('/api/auth/signup').send({
      name: 'Alice',
      email: 'alice@example.com',
      password: 'password123',
    });

    const bob = await request(app).post('/api/auth/signup').send({
      name: 'Bob',
      email: 'bob@example.com',
      password: 'password123',
    });

    const agent = request.agent(app);
    const loginResponse = await agent.post('/api/auth/login').send({
      email: 'alice@example.com',
      password: 'password123',
    });

    expect(loginResponse.status).toBe(200);

    const groupResponse = await agent.post('/api/groups').send({
      name: 'Trip to Goa',
      members: [{ email: bob.body.data.user.email }],
    });

    expect(groupResponse.status).toBe(201);
    expect(groupResponse.body.success).toBe(true);
    expect(groupResponse.body.data.members).toHaveLength(2);
    expect(groupResponse.body.data.members.some((member) => member.user?.email === 'bob@example.com')).toBe(true);
  });
});
