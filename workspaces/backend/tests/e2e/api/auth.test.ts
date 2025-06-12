import { setupTestDatabase, teardownTestDatabase, request, createTestUser } from '../../setup';
import bcrypt from 'bcrypt';
import { knex } from '../../setup';

describe('Auth API Endpoints', () => {
  // Setup database before all tests
  beforeAll(async () => {
    await setupTestDatabase();
    
    // Create a test user directly in the database
    await knex('usuarios').insert({
      nome: 'Usuário Existente',
      login: 'existente@exemplo.com',
      senha: await bcrypt.hash('senha123', 10),
      criado_em: new Date(),
      alterado_em: new Date()
    });
  });

  // Teardown database after all tests
  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user and return token', async () => {
      const userData = {
        nome: 'Novo Usuário',
        login: 'novo@exemplo.com',
        senha: 'senha123'
      };

      const response = await request
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('usuario');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.usuario.nome).toBe(userData.nome);
      expect(response.body.data.usuario.login).toBe(userData.login);
      expect(response.body.data.usuario).not.toHaveProperty('senha');
    });

    it('should return 409 if login already exists', async () => {
      const userData = {
        nome: 'Usuário Duplicado',
        login: 'existente@exemplo.com', // This login already exists
        senha: 'senha123'
      };

      const response = await request
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(409);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Este login já está em uso');
    });

    it('should return 400 if validation fails', async () => {
      const invalidUserData = {
        nome: 'Usuário Inválido',
        login: 'invalido', // Missing @ symbol
        senha: '123' // Too short
      };

      const response = await request
        .post('/api/auth/register')
        .send(invalidUserData);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user and return token', async () => {
      const loginData = {
        login: 'existente@exemplo.com',
        senha: 'senha123'
      };

      const response = await request
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('usuario');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.usuario.login).toBe(loginData.login);
      expect(response.body.data.usuario).not.toHaveProperty('senha');
    });

    it('should return 401 if credentials are invalid', async () => {
      const invalidLoginData = {
        login: 'existente@exemplo.com',
        senha: 'senha_errada'
      };

      const response = await request
        .post('/api/auth/login')
        .send(invalidLoginData);

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Credenciais inválidas');
    });

    it('should return 400 if validation fails', async () => {
      const invalidLoginData = {
        login: 'invalido', // Missing @ symbol
        senha: '123' // Too short
      };

      const response = await request
        .post('/api/auth/login')
        .send(invalidLoginData);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user profile when authenticated', async () => {
      // First create a user and get token
      const { token, usuario } = await createTestUser();

      const response = await request
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('login');
      expect(response.body.data.id).toBe(usuario.id);
      expect(response.body.data.login).toBe(usuario.login);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Token de autenticação não fornecido');
    });

    it('should return 401 when token is invalid', async () => {
      const response = await request
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token');

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Token inválido ou expirado');
    });
  });
});