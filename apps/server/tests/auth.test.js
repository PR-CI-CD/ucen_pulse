const request = require('supertest');
const { app, sequelize } = require('../app');
const User = require('../models/User');

describe('Authentication API', () => {
  beforeAll(async () => {
    await sequelize.authenticate();
  });

  beforeEach(async () => {
    await User.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('should register a new user successfully', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Michael Smith',
        email: 'michael@example.com',
        password: 'password123',
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBeDefined();
  });

  test('should login an existing user successfully', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Michael Smith',
        email: 'michael@example.com',
        password: 'password123',
      });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'michael@example.com',
        password: 'password123',
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.user.email).toBe('michael@example.com');

    const setCookieHeader = response.headers['set-cookie'];
    expect(setCookieHeader).toBeDefined();
  });

  test('should reject login with invalid password', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Michael Smith',
        email: 'michael@example.com',
        password: 'password123',
      });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'michael@example.com',
        password: 'wrongpassword',
      });

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });
});