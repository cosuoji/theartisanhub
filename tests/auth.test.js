// tests/auth.test.js

const request = require('supertest');
const app = require('../server.js'); 
const User = require('../models/User.js');

describe('Auth Endpoints', () => {
  afterEach(async () => {
    await User.deleteMany();
  });

  it('POST /api/auth/signup → 201', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Alice',
        email: 'alice@example.com',
        password: 'StrongPass1!',
        role: 'user',
      });
    expect(res.statusCode).toBe(201);
  });

  it('POST /api/auth/login → 200', async () => {
    await User.create({
      name: 'Bob',
      email: 'bob@example.com',
      password: 'StrongPass1!',
      role: 'user',
    });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'bob@example.com', password: 'StrongPass1!' });
    expect(res.statusCode).toBe(200);
  });
});

describe('Mobile Login', () => {
  it('should return tokens in response for mobile', async () => {
    await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password',
      role: 'user',
    });

    const mobileUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)';
    const res = await request(app)
      .post('/auth/login')
      .set('User-Agent', mobileUA)
      .send({ email: 'test@example.com', password: 'password' });

    expect(res.body.tokens).toBeDefined();
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('should work without cookies when mobile tokens exist', async () => {
    await User.create({
      name: 'Test Again',
      email: 'testagain@example.com',
      password: 'password',
      role: 'user',
    });

    const loginRes = await request(app)
      .post('/auth/login')
      .send({ email: 'testagain@example.com', password: 'password' });

    const { refreshToken, accessToken } = loginRes.body.tokens;

    const apiRes = await request(app)
      .get('/protected-route')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('X-Refresh-Token', refreshToken);

    expect(apiRes.status).toBe(200);
  });
});
