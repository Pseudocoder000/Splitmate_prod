const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const User = require('../src/models/User');
const RefreshToken = require('../src/models/RefreshToken');

jest.setTimeout(30000);

describe('Auth routes', () => {
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

  it('signs up a new user', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        password: 'password123'
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe('ada@example.com');
  });

  it('logs in an existing user', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'ada@example.com',
        password: 'password123'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe('ada@example.com');
  });

  it('returns the current user from cookie-based auth', async () => {
    const agent = request.agent(app);

    const loginResponse = await agent
      .post('/api/auth/login')
      .send({
        email: 'ada@example.com',
        password: 'password123'
      });

    expect(loginResponse.status).toBe(200);

    const meResponse = await agent.get('/api/auth/me');
    expect(meResponse.status).toBe(200);
    expect(meResponse.body.success).toBe(true);
    expect(meResponse.body.data.user.email).toBe('ada@example.com');
  });

  it('allows local frontend origins during auth requests', async () => {
    const response = await request(app)
      .options('/api/auth/me')
      .set('Origin', 'http://127.0.0.1:5173')
      .set('Access-Control-Request-Method', 'GET');

    expect(response.status).toBe(204);
    expect(response.headers['access-control-allow-origin']).toBe('http://127.0.0.1:5173');
  });
});
