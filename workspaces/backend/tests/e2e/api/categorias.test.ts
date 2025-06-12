import { setupTestDatabase, teardownTestDatabase, request, createTestUser, createTestCategory } from '../../setup';
import { knex } from '../../setup';

describe('Categorias API Endpoints', () => {
  let authToken: string;
  let userId: number;

  // Setup database and create a user before all tests
  beforeAll(async () => {
    await setupTestDatabase();

    // Create a test user and get token
    const { token, usuario } = await createTestUser({
      nome: 'Usuário Categorias',
      login: 'categorias@exemplo.com',
      senha: 'senha123'
    });

    authToken = token;
    userId = usuario.id;

    // Seed some categories
    await knex('categorias').insert([
      { id: 1, nome: 'Categoria 1' },
      { id: 2, nome: 'Categoria 2' },
      { id: 3, nome: 'Categoria 3' }
    ]);
  });

  // Teardown database after all tests
  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe('GET /api/categorias', () => {
    it('should return all categories', async () => {
      const response = await request
        .get('/api/categorias');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(3);

      // Check if the seeded categories are present
      const categoryNames = response.body.data.map((cat: any) => cat.nome);
      expect(categoryNames).toContain('Categoria 1');
      expect(categoryNames).toContain('Categoria 2');
      expect(categoryNames).toContain('Categoria 3');
    });
  });

  describe('GET /api/categorias/:id', () => {
    it('should return a specific category', async () => {
      const response = await request
        .get('/api/categorias/1');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('id', 1);
      expect(response.body.data).toHaveProperty('nome', 'Categoria 1');
    });

    it('should return 404 for non-existent category', async () => {
      const response = await request
        .get('/api/categorias/999');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('não encontrada');
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request
        .get('/api/categorias/invalid');

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('POST /api/categorias', () => {
    it('should create a new category when authenticated', async () => {
      const categoryData = {
        nome: 'Nova Categoria'
      };

      const response = await request
        .post('/api/categorias')
        .set('Authorization', `Bearer ${authToken}`)
        .send(categoryData);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('nome', categoryData.nome);

      // Verify the category was actually created in the database
      const category = await knex('categorias').where('nome', categoryData.nome).first();
      expect(category).toBeTruthy();
      expect(category.nome).toBe(categoryData.nome);
    });

    it('should return 401 when not authenticated', async () => {
      const categoryData = {
        nome: 'Categoria Sem Autenticação'
      };

      const response = await request
        .post('/api/categorias')
        .send(categoryData);

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Token de autenticação não fornecido');
    });

    it('should return 409 if category name already exists', async () => {
      const categoryData = {
        nome: 'Categoria 1' // This name already exists
      };

      const response = await request
        .post('/api/categorias')
        .set('Authorization', `Bearer ${authToken}`)
        .send(categoryData);

      expect(response.status).toBe(409);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Já existe uma categoria com este nome');
    });

    it('should return 400 if validation fails', async () => {
      const invalidCategoryData = {
        nome: 'ab' // Too short
      };

      const response = await request
        .post('/api/categorias')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidCategoryData);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('PUT /api/categorias/:id', () => {
    it('should update a category when authenticated', async () => {
      const updateData = {
        nome: 'Categoria 1 Atualizada'
      };

      const response = await request
        .put('/api/categorias/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('id', 1);
      expect(response.body.data).toHaveProperty('nome', updateData.nome);

      // Verify the category was actually updated in the database
      const category = await knex('categorias').where('id', 1).first();
      expect(category).toBeTruthy();
      expect(category.nome).toBe(updateData.nome);
    });

    it('should return 401 when not authenticated', async () => {
      const updateData = {
        nome: 'Categoria Sem Autenticação'
      };

      const response = await request
        .put('/api/categorias/2')
        .send(updateData);

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Token de autenticação não fornecido');
    });

    it('should return 404 for non-existent category', async () => {
      const updateData = {
        nome: 'Categoria Inexistente'
      };

      const response = await request
        .put('/api/categorias/999')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('não encontrada');
    });

    it('should return 409 if category name already exists', async () => {
      const updateData = {
        nome: 'Categoria 2' // This name already exists
      };

      const response = await request
        .put('/api/categorias/3')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(409);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Já existe uma categoria com este nome');
    });

    it('should return 400 if validation fails', async () => {
      const invalidUpdateData = {
        nome: 'ab' // Too short
      };

      const response = await request
        .put('/api/categorias/2')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidUpdateData);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('DELETE /api/categorias/:id', () => {
    it('should delete a category when authenticated', async () => {
      // First create a category to delete
      const { id } = await createTestCategory(authToken, 'Categoria para Deletar');

      const response = await request
        .delete(`/api/categorias/${id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Categoria excluída com sucesso');
      expect(response.body.data).toBeTruthy();
      expect(response.body.data).toHaveProperty('id', id);
      expect(response.body.data).toHaveProperty('nome', 'Categoria para Deletar');

      // Verify the category was actually deleted from the database
      const category = await knex('categorias').where('id', id).first();
      expect(category).toBeUndefined();
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request
        .delete('/api/categorias/2');

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Token de autenticação não fornecido');
    });

    it('should return 404 for non-existent category', async () => {
      const response = await request
        .delete('/api/categorias/999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('não encontrada');
    });
  });
});
