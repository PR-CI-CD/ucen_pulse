const request = require('supertest');
const { app, sequelize } = require('../app');
const User = require('../models/User');
const Activity = require('../models/Activity');

describe('Activity API', () => {
  let authCookie;

  beforeAll(async () => {
    await sequelize.authenticate();
  });

  beforeEach(async () => {
    await Activity.destroy({ where: {} });
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

  test('should create an activity for the authenticated user', async () => {
    const response = await request(app)
      .post('/api/activities')
      .set('Cookie', authCookie)
      .send({
        id: 'activity-1',
        dateISO: '2026-04-13',
        type: 'Running',
        duration: 30,
        notes: 'Felt strong today',
        createdAt: Date.now(),
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.type).toBe('Running');
    expect(response.body.data.duration).toBe(30);
  });

  test('should fetch activities for the authenticated user', async () => {
    await request(app)
      .post('/api/activities')
      .set('Cookie', authCookie)
      .send({
        id: 'activity-1',
        dateISO: '2026-04-13',
        type: 'Running',
        duration: 30,
        notes: 'Felt strong today',
        createdAt: Date.now(),
      });

    const response = await request(app)
      .get('/api/activities')
      .set('Cookie', authCookie);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBe(1);
  });
});