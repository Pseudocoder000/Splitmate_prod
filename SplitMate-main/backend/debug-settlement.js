const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('./src/app');
const User = require('./src/models/User');
const RefreshToken = require('./src/models/RefreshToken');
const Group = require('./src/models/Group');

(async () => {
  const ms = await MongoMemoryServer.create();
  await mongoose.connect(ms.getUri());
  await User.deleteMany({});
  await RefreshToken.deleteMany({});
  await Group.deleteMany({});

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
  const agent = request.agent(app);
  await agent.post('/api/auth/login').send({
    email: 'alice@example.com',
    password: 'password123',
  });
  const groupResponse = await agent.post('/api/groups').send({ name: 'Weekend Trip' });
  const settlementResponse = await agent.post('/api/settlements').send({
    groupId: groupResponse.body.data._id,
    from: signupA.body.data.user.id,
    to: signupB.body.data.user.id,
    amount: 120,
    note: 'Settled dinner',
  });
  console.log('status', settlementResponse.status);
  console.log(JSON.stringify(settlementResponse.body, null, 2));
  await mongoose.disconnect();
  await ms.stop();
})().catch((err) => {
  console.error(err.stack);
  process.exit(1);
});
