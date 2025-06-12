import request from 'supertest';
import app from '../../../source/config/app';
import { setupTestDatabase, teardownTestDatabase } from '../../setup';
import { generateToken } from '../../../source/config/jwt';

describe('Auth API', () => {
  // Use the imported app directly

  beforeAll(async () => {
    // Set up the test database
    await setupTestDatabase();
  });

  afterAll(async () => {
    // Clean up the test database
    await teardownTestDatabase();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user and return token', async () => {
      // Arrange
      const newUser = {
        nome: 'Test User',
        login: 'test@example.com',
        senha: 'password123'
      };

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect('Content-Type', /json/)
        .expect(201);

      // Assert
      expect(response.body.status).toBe("success");
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.usuario).toHaveProperty('id');
      expect(response.body.data.usuario.nome).toBe(newUser.nome);
      expect(response.body.data.usuario.login).toBe(newUser.login);
      expect(response.body.data.usuario).not.toHaveProperty('senha');
    });

    it('should return 409 when login is already in use', async () => {
      // Arrange
      const existingUser = {
        nome: 'Existing User',
        login: 'existing@example.com',
        senha: 'password123'
      };

      // First register the user
      await request(app)
        .post('/api/auth/register')
        .send(existingUser);

      // Act - Try to register with the same login
      const response = await request(app)
        .post('/api/auth/register')
        .send(existingUser)
        .expect('Content-Type', /json/)
        .expect(409);

      // Assert
      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe('Este login já está em uso');
    });

    it('should return 400 when validation fails', async () => {
      // Arrange
      const invalidUser = {
        nome: 'Invalid User',
        login: 'not-an-email',
        senha: '123' // Too short
      };

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect('Content-Type', /json/)
        .expect(400);

      // Assert
      expect(response.body.status).toBe("error");
      expect(response.body.errors).toBeTruthy();
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user for login tests
      const testUser = {
        nome: 'Login Test User',
        login: 'login-test@example.com',
        senha: 'password123'
      };

      await request(app)
        .post('/api/auth/register')
        .send(testUser);
    });

    it('should login successfully with valid credentials', async () => {
      // Arrange
      const credentials = {
        login: 'login-test@example.com',
        senha: 'password123'
      };

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect('Content-Type', /json/)
        .expect(200);

      // Assert
      expect(response.body.status).toBe("success");
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.usuario).toHaveProperty('id');
      expect(response.body.data.usuario.login).toBe(credentials.login);
      expect(response.body.data.usuario).not.toHaveProperty('senha');
    });

    it('should return 401 with invalid credentials', async () => {
      // Arrange
      const invalidCredentials = {
        login: 'login-test@example.com',
        senha: 'wrong-password'
      };

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send(invalidCredentials)
        .expect('Content-Type', /json/)
        .expect(401);

      // Assert
      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe('Credenciais inválidas');
    });

    it('should return 401 when user does not exist', async () => {
      // Arrange
      const nonExistentUser = {
        login: 'nonexistent@example.com',
        senha: 'password123'
      };

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send(nonExistentUser)
        .expect('Content-Type', /json/)
        .expect(401);

      // Assert
      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe('Credenciais inválidas');
    });
  });

  describe('GET /api/auth/me', () => {
    let token: string;
    let userId: number;
    let userLogin: string;

    beforeEach(async () => {
      // Create a test user and get token
      const testUser = {
        nome: 'Profile Test User',
        login: `profile-test-${Date.now()}@example.com`, // Use unique email to avoid conflicts
        senha: 'password123'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201); // Ensure registration was successful

      // Add error handling to help debug issues
      if (!registerResponse.body.data || !registerResponse.body.data.token) {
        console.error('Registration response:', JSON.stringify(registerResponse.body, null, 2));
        throw new Error('Failed to get token from registration response');
      }

      token = registerResponse.body.data.token;
      userId = registerResponse.body.data.usuario.id;
      userLogin = registerResponse.body.data.usuario.login;
    });

    it('should return user profile when authenticated', async () => {
      // Act
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .expect(200);

      // Assert
      expect(response.body.status).toBe("success");
      expect(response.body.data).toHaveProperty('id', userId);
      expect(response.body.data).toHaveProperty('login', userLogin);
    });

    it('should return 401 when not authenticated', async () => {
      // Act
      const response = await request(app)
        .get('/api/auth/me')
        .expect('Content-Type', /json/)
        .expect(401);

      // Assert
      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe('Token de autenticação não fornecido');
    });

    it('should return 401 when token is invalid', async () => {
      // Act
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect('Content-Type', /json/)
        .expect(401);

      // Assert
      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe('Token inválido ou expirado');
    });
  });
});
