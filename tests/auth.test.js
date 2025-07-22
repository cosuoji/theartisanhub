import request from 'supertest';
import app from '../server.js'; // server.js exports app
import User from '../models/User.js';

describe('Auth Endpoints', () => {
  afterEach(async () => await User.deleteMany());

  it('POST /api/auth/signup → 201', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Alice', email: 'alice@example.com', password: 'StrongPass1!', role: 'user' });
    expect(res.statusCode).toBe(201);
  });

  it('POST /api/auth/login → 200', async () => {
    await User.create({ name: 'Bob', email: 'bob@example.com', password: 'StrongPass1!', role: 'user' });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'bob@example.com', password: 'StrongPass1!' });
    expect(res.statusCode).toBe(200);
  });
});