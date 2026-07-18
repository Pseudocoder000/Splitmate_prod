const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const User = require('../src/models/User');
const RefreshToken = require('../src/models/RefreshToken');
const Group = require('../src/models/Group');

jest.setTimeout(60000);

describe('Settlement routes', () => {
  let memoryServer;

  beforeAll(async () => {
    memoryServer = await MongoMemoryServer.create();
    await mongoose.connect(memoryServer.getUri());
    await User.deleteMany({});
    await RefreshToken.deleteMany({});
    await Group.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await memoryServer.stop();
  });

  it('creates a settlement and persists it for a group', async () => {
    const signupA = await request(app).post('/api/auth/signup').send({
      name: 'Alice',
      email: 'alice@example.com',
      password: 'password123',
    });

    const signupB = await request(app).post('/api/auth/signup').send({
      name: 'Bob',
      email: 'bob@example.com',
      password: 'password123',
    });

    expect(signupA.status).toBe(201);
    expect(signupB.status).toBe(201);

    const agent = request.agent(app);
    const loginResponse = await agent.post('/api/auth/login').send({
      email: 'alice@example.com',
      password: 'password123',
    });

    expect(loginResponse.status).toBe(200);

    const groupResponse = await agent.post('/api/groups').send({ name: 'Weekend Trip' });
    expect(groupResponse.status).toBe(201);

    const groupId = groupResponse.body.data._id;

    const settlementResponse = await agent.post('/api/settlements').send({
      groupId,
      from: signupA.body.data.user.id,
      to: signupB.body.data.user.id,
      amount: 120,
      note: 'Settled dinner',
    });

    expect(settlementResponse.status).toBe(201);
    expect(settlementResponse.body.success).toBe(true);
    expect(settlementResponse.body.data.amount).toBe(120);
  });
});
