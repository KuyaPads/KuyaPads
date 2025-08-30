const request = require('supertest');
const { app } = require('../server');

describe('API Health Check', () => {
  test('GET /health should return 200', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body.status).toBe('OK');
    expect(response.body.timestamp).toBeDefined();
  });
});

describe('Auth Endpoints', () => {
  test('POST /api/auth/register should create a new user', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      first_name: 'Test',
      last_name: 'User'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);
    
    expect(response.body.user).toBeDefined();
    expect(response.body.token).toBeDefined();
    expect(response.body.user.email).toBe(userData.email);
  });

  test('POST /api/auth/login should authenticate user', async () => {
    const credentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(credentials)
      .expect(200);
    
    expect(response.body.user).toBeDefined();
    expect(response.body.token).toBeDefined();
  });
});

describe('Protected Routes', () => {
  let authToken;

  beforeAll(async () => {
    // Login to get auth token
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    authToken = response.body.token;
  });

  test('GET /api/auth/me should return user info when authenticated', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    
    expect(response.body.user).toBeDefined();
    expect(response.body.user.email).toBe('test@example.com');
  });

  test('GET /api/pads should return user pads', async () => {
    const response = await request(app)
      .get('/api/pads')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    
    expect(response.body.pads).toBeDefined();
    expect(Array.isArray(response.body.pads)).toBe(true);
  });
});