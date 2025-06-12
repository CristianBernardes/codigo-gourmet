import request from 'supertest';
import app from '../../../source/config/app';
import { setupTestDatabase, teardownTestDatabase } from '../../setup';
import { generateToken } from '../../../source/config/jwt';

describe('Categorias API', () => {
  let authToken: string;
  
  beforeAll(async () => {
    await setupTestDatabase();
    
    // Criar um usuário e obter token para testes autenticados
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        nome: 'Teste Categorias',
        login: 'teste-categorias@example.com',
        senha: 'senha123'
      });
    
    authToken = registerResponse.body.data.token;
  });
  
  afterAll(async () => {
    await teardownTestDatabase();
  });
  
  describe('GET /api/categorias', () => {
    it('should return list of categories', async () => {
      const response = await request(app)
        .get('/api/categorias')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
  
  describe('POST /api/categorias', () => {
    it('should create a new category when authenticated', async () => {
      const newCategory = {
        nome: 'Nova Categoria de Teste'
      };
      
      const response = await request(app)
        .post('/api/categorias')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newCategory)
        .expect('Content-Type', /json/)
        .expect(201);
      
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.nome).toBe(newCategory.nome);
    });
    
    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/api/categorias')
        .send({ nome: 'Categoria Sem Auth' })
        .expect('Content-Type', /json/)
        .expect(401);
      
      expect(response.body.status).toBe('error');
    });
    
    it('should return 400 when validation fails', async () => {
      const response = await request(app)
        .post('/api/categorias')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nome: '' }) // Nome vazio deve falhar na validação
        .expect('Content-Type', /json/)
        .expect(400);
      
      expect(response.body.status).toBe('error');
      expect(response.body.errors).toBeTruthy();
    });
    
    it('should return 409 when category name already exists', async () => {
      const categoryName = 'Categoria Duplicada';
      
      // Primeiro, cria a categoria
      await request(app)
        .post('/api/categorias')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nome: categoryName });
      
      // Tenta criar novamente com o mesmo nome
      const response = await request(app)
        .post('/api/categorias')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nome: categoryName })
        .expect('Content-Type', /json/)
        .expect(409);
      
      expect(response.body.status).toBe('error');
    });
  });
  
  describe('GET /api/categorias/{id}', () => {
    let categoryId: number;
    
    beforeEach(async () => {
      // Criar uma categoria para testar
      const createResponse = await request(app)
        .post('/api/categorias')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nome: `Categoria Teste ${Date.now()}` });
      
      categoryId = createResponse.body.data.id;
    });
    
    it('should return a category by id', async () => {
      const response = await request(app)
        .get(`/api/categorias/${categoryId}`)
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('id', categoryId);
    });
    
    it('should return 404 when category does not exist', async () => {
      const nonExistentId = 9999;
      
      const response = await request(app)
        .get(`/api/categorias/${nonExistentId}`)
        .expect('Content-Type', /json/)
        .expect(404);
      
      expect(response.body.status).toBe('error');
    });
  });
  
  describe('PUT /api/categorias/{id}', () => {
    let categoryId: number;
    
    beforeEach(async () => {
      // Criar uma categoria para testar
      const createResponse = await request(app)
        .post('/api/categorias')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nome: `Categoria para Atualizar ${Date.now()}` });
      
      categoryId = createResponse.body.data.id;
    });
    
    it('should update a category when authenticated', async () => {
      const updatedName = 'Categoria Atualizada';
      
      const response = await request(app)
        .put(`/api/categorias/${categoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nome: updatedName })
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('id', categoryId);
      expect(response.body.data.nome).toBe(updatedName);
    });
    
    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .put(`/api/categorias/${categoryId}`)
        .send({ nome: 'Tentativa Sem Auth' })
        .expect('Content-Type', /json/)
        .expect(401);
      
      expect(response.body.status).toBe('error');
    });
    
    it('should return 404 when category does not exist', async () => {
      const nonExistentId = 9999;
      
      const response = await request(app)
        .put(`/api/categorias/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nome: 'Categoria Inexistente' })
        .expect('Content-Type', /json/)
        .expect(404);
      
      expect(response.body.status).toBe('error');
    });
    
    it('should return 400 when validation fails', async () => {
      const response = await request(app)
        .put(`/api/categorias/${categoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nome: '' }) // Nome vazio deve falhar na validação
        .expect('Content-Type', /json/)
        .expect(400);
      
      expect(response.body.status).toBe('error');
      expect(response.body.errors).toBeTruthy();
    });
  });
  
  describe('DELETE /api/categorias/{id}', () => {
    let categoryId: number;
    
    beforeEach(async () => {
      // Criar uma categoria para testar
      const createResponse = await request(app)
        .post('/api/categorias')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nome: `Categoria para Excluir ${Date.now()}` });
      
      categoryId = createResponse.body.data.id;
    });
    
    it('should delete a category when authenticated', async () => {
      const response = await request(app)
        .delete(`/api/categorias/${categoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body.status).toBe('success');
      
      // Verificar se a categoria foi realmente excluída
      const getResponse = await request(app)
        .get(`/api/categorias/${categoryId}`)
        .expect(404);
      
      expect(getResponse.body.status).toBe('error');
    });
    
    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .delete(`/api/categorias/${categoryId}`)
        .expect('Content-Type', /json/)
        .expect(401);
      
      expect(response.body.status).toBe('error');
    });
    
    it('should return 404 when category does not exist', async () => {
      const nonExistentId = 9999;
      
      const response = await request(app)
        .delete(`/api/categorias/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(404);
      
      expect(response.body.status).toBe('error');
    });
  });
});