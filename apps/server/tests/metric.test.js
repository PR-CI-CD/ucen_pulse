const request = require('supertest');
const { app, sequelize } = require('../app');
const User = require('../models/User');
const Metric = require('../models/Metric');

describe('Metric API', () => {
  let authCookie;

  beforeAll(async () => {
    await sequelize.authenticate();
  });

  beforeEach(async () => {
    await Metric.destroy({ where: {} });
    await User.destroy({ where: {} });

    await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Michael Smith',
        email: 'michael@example.com',
        password: 'password123',
      });

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'michael@example.com',
        password: 'password123',
      });

    authCookie = loginResponse.headers['set-cookie'];
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('should create a metric for the authenticated user', async () => {
    const response = await request(app)
      .post('/api/metrics')
      .set('Cookie', authCookie)
      .send({
        id: 'metric-1',
        dateISO: '2026-04-13',
        type: 'Steps',
        value: 8500,
        unit: 'steps',
        notes: 'Good walking day',
        createdAt: Date.now(),
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.type).toBe('Steps');
    expect(response.body.data.value).toBe(8500);
  });

  test('should fetch metrics for the authenticated user', async () => {
    await request(app)
      .post('/api/metrics')
      .set('Cookie', authCookie)
      .send({
        id: 'metric-1',
        dateISO: '2026-04-13',
        type: 'Steps',
        value: 8500,
        unit: 'steps',
        notes: 'Good walking day',
        createdAt: Date.now(),
      });

    const response = await request(app)
      .get('/api/metrics')
      .set('Cookie', authCookie);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBe(1);
  });
});