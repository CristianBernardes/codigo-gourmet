import { setupTestDatabase, teardownTestDatabase, request, createTestUser, createTestCategory, createTestRecipe } from '../../setup';
import { knex } from '../../setup';

describe('Receitas API Endpoints', () => {
  let authToken: string;
  let userId: number;
  let categoriaId: number;
  let receitaId: number;

  // Setup database and create a user before all tests
  beforeAll(async () => {
    await setupTestDatabase();
    
    // Create a test user and get token
    const { token, usuario } = await createTestUser({
      nome: 'Usuário Receitas',
      login: 'receitas@exemplo.com',
      senha: 'senha123'
    });
    
    authToken = token;
    userId = usuario.id;
    
    // Create a test category
    await knex('categorias').insert({ id: 1, nome: 'Categoria de Teste' });
    categoriaId = 1;
    
    // Create a test recipe
    const receitaData = {
      id: 1,
      id_usuarios: userId,
      id_categorias: categoriaId,
      nome: 'Receita de Teste',
      tempo_preparo_minutos: 30,
      porcoes: 4,
      modo_preparo: 'Modo de preparo de teste. Passo 1: Teste. Passo 2: Teste.',
      ingredientes: '- Ingrediente 1\n- Ingrediente 2\n- Ingrediente 3',
      criado_em: new Date(),
      alterado_em: new Date()
    };
    
    await knex('receitas').insert(receitaData);
    receitaId = 1;
  });

  // Teardown database after all tests
  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe('GET /api/receitas', () => {
    it('should return all recipes', async () => {
      const response = await request
        .get('/api/receitas');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      
      // Check if the test recipe is present
      const recipeNames = response.body.data.map((recipe: any) => recipe.nome);
      expect(recipeNames).toContain('Receita de Teste');
    });
  });

  describe('GET /api/receitas/:id', () => {
    it('should return a specific recipe', async () => {
      const response = await request
        .get(`/api/receitas/${receitaId}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('id', receitaId);
      expect(response.body.data).toHaveProperty('nome', 'Receita de Teste');
      expect(response.body.data).toHaveProperty('id_usuarios', userId);
      expect(response.body.data).toHaveProperty('id_categorias', categoriaId);
      expect(response.body.data).toHaveProperty('usuario');
      expect(response.body.data).toHaveProperty('categoria');
    });

    it('should return 404 for non-existent recipe', async () => {
      const response = await request
        .get('/api/receitas/999');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('não encontrada');
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request
        .get('/api/receitas/invalid');

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('GET /api/receitas/usuario/:id_usuarios', () => {
    it('should return recipes for a specific user', async () => {
      const response = await request
        .get(`/api/receitas/usuario/${userId}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      
      // All recipes should belong to the specified user
      response.body.data.forEach((recipe: any) => {
        expect(recipe.id_usuarios).toBe(userId);
      });
    });

    it('should return empty array for user with no recipes', async () => {
      // Create a new user without recipes
      const { usuario: newUser } = await createTestUser({
        nome: 'Usuário Sem Receitas',
        login: 'sem-receitas@exemplo.com'
      });

      const response = await request
        .get(`/api/receitas/usuario/${newUser.id}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });
  });

  describe('GET /api/receitas/categoria/:id_categorias', () => {
    it('should return recipes for a specific category', async () => {
      const response = await request
        .get(`/api/receitas/categoria/${categoriaId}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      
      // All recipes should belong to the specified category
      response.body.data.forEach((recipe: any) => {
        expect(recipe.id_categorias).toBe(categoriaId);
      });
    });

    it('should return 404 for non-existent category', async () => {
      const response = await request
        .get('/api/receitas/categoria/999');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Categoria não encontrada');
    });
  });

  describe('GET /api/receitas/search', () => {
    it('should search recipes by term', async () => {
      // Create a recipe with specific terms for searching
      await createTestRecipe(authToken, {
        nome: 'Bolo de Chocolate',
        ingredientes: '- Chocolate em pó\n- Farinha\n- Açúcar',
        modo_preparo: 'Misture tudo e asse no forno'
      });

      const response = await request
        .get('/api/receitas/search')
        .query({ termo_busca: 'chocolate' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      
      // At least one recipe should contain the search term
      const hasMatchingRecipe = response.body.data.some((recipe: any) => 
        recipe.nome.toLowerCase().includes('chocolate') || 
        recipe.ingredientes.toLowerCase().includes('chocolate') || 
        recipe.modo_preparo.toLowerCase().includes('chocolate')
      );
      expect(hasMatchingRecipe).toBe(true);
    });

    it('should filter recipes by user and category', async () => {
      const response = await request
        .get('/api/receitas/search')
        .query({ 
          id_usuarios: userId,
          id_categorias: categoriaId
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // All recipes should match the filters
      response.body.data.forEach((recipe: any) => {
        expect(recipe.id_usuarios).toBe(userId);
        expect(recipe.id_categorias).toBe(categoriaId);
      });
    });
  });

  describe('POST /api/receitas', () => {
    it('should create a new recipe when authenticated', async () => {
      const recipeData = {
        id_categorias: categoriaId,
        nome: 'Nova Receita',
        tempo_preparo_minutos: 45,
        porcoes: 6,
        modo_preparo: 'Modo de preparo da nova receita. Passo 1: Teste. Passo 2: Teste.',
        ingredientes: '- Novo Ingrediente 1\n- Novo Ingrediente 2\n- Novo Ingrediente 3'
      };

      const response = await request
        .post('/api/receitas')
        .set('Authorization', `Bearer ${authToken}`)
        .send(recipeData);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('nome', recipeData.nome);
      expect(response.body.data).toHaveProperty('id_usuarios', userId);
      expect(response.body.data).toHaveProperty('id_categorias', categoriaId);
      
      // Verify the recipe was actually created in the database
      const recipe = await knex('receitas').where('nome', recipeData.nome).first();
      expect(recipe).toBeTruthy();
      expect(recipe.nome).toBe(recipeData.nome);
      expect(recipe.id_usuarios).toBe(userId);
    });

    it('should return 401 when not authenticated', async () => {
      const recipeData = {
        id_categorias: categoriaId,
        nome: 'Receita Sem Autenticação',
        tempo_preparo_minutos: 30,
        porcoes: 4,
        modo_preparo: 'Modo de preparo. Passo 1: Teste. Passo 2: Teste.',
        ingredientes: '- Ingrediente 1\n- Ingrediente 2\n- Ingrediente 3'
      };

      const response = await request
        .post('/api/receitas')
        .send(recipeData);

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Token de autenticação não fornecido');
    });

    it('should return 404 if category does not exist', async () => {
      const recipeData = {
        id_categorias: 999, // Non-existent category
        nome: 'Receita com Categoria Inválida',
        tempo_preparo_minutos: 30,
        porcoes: 4,
        modo_preparo: 'Modo de preparo. Passo 1: Teste. Passo 2: Teste.',
        ingredientes: '- Ingrediente 1\n- Ingrediente 2\n- Ingrediente 3'
      };

      const response = await request
        .post('/api/receitas')
        .set('Authorization', `Bearer ${authToken}`)
        .send(recipeData);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Categoria não encontrada');
    });

    it('should return 400 if validation fails', async () => {
      const invalidRecipeData = {
        id_categorias: categoriaId,
        nome: 'Rx', // Too short
        tempo_preparo_minutos: -5, // Negative value
        modo_preparo: 'Curto', // Too short
        ingredientes: 'Curto' // Too short
      };

      const response = await request
        .post('/api/receitas')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidRecipeData);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('PUT /api/receitas/:id', () => {
    it('should update a recipe when authenticated as owner', async () => {
      const updateData = {
        nome: 'Receita de Teste Atualizada',
        tempo_preparo_minutos: 40,
        porcoes: 5
      };

      const response = await request
        .put(`/api/receitas/${receitaId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('id', receitaId);
      expect(response.body.data).toHaveProperty('nome', updateData.nome);
      expect(response.body.data).toHaveProperty('tempo_preparo_minutos', updateData.tempo_preparo_minutos);
      expect(response.body.data).toHaveProperty('porcoes', updateData.porcoes);
      
      // Verify the recipe was actually updated in the database
      const recipe = await knex('receitas').where('id', receitaId).first();
      expect(recipe).toBeTruthy();
      expect(recipe.nome).toBe(updateData.nome);
      expect(recipe.tempo_preparo_minutos).toBe(updateData.tempo_preparo_minutos);
    });

    it('should return 401 when not authenticated', async () => {
      const updateData = {
        nome: 'Receita Sem Autenticação'
      };

      const response = await request
        .put(`/api/receitas/${receitaId}`)
        .send(updateData);

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Token de autenticação não fornecido');
    });

    it('should return 403 when authenticated as non-owner', async () => {
      // Create another user
      const { token: otherToken } = await createTestUser({
        nome: 'Outro Usuário',
        login: 'outro@exemplo.com'
      });

      const updateData = {
        nome: 'Tentativa de Atualização por Outro Usuário'
      };

      const response = await request
        .put(`/api/receitas/${receitaId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send(updateData);

      expect(response.status).toBe(403);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('não tem permissão');
    });

    it('should return 404 for non-existent recipe', async () => {
      const updateData = {
        nome: 'Receita Inexistente'
      };

      const response = await request
        .put('/api/receitas/999')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('não encontrada');
    });

    it('should return 400 if validation fails', async () => {
      const invalidUpdateData = {
        nome: 'Rx', // Too short
        modo_preparo: 'Curto' // Too short
      };

      const response = await request
        .put(`/api/receitas/${receitaId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidUpdateData);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('DELETE /api/receitas/:id', () => {
    it('should delete a recipe when authenticated as owner', async () => {
      // First create a recipe to delete
      const { id } = await createTestRecipe(authToken, {
        nome: 'Receita para Deletar'
      });

      const response = await request
        .delete(`/api/receitas/${id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Receita excluída com sucesso');
      
      // Verify the recipe was actually deleted from the database
      const recipe = await knex('receitas').where('id', id).first();
      expect(recipe).toBeUndefined();
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request
        .delete(`/api/receitas/${receitaId}`);

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Token de autenticação não fornecido');
    });

    it('should return 403 when authenticated as non-owner', async () => {
      // Create another user
      const { token: otherToken } = await createTestUser({
        nome: 'Outro Usuário para Deletar',
        login: 'outro-deletar@exemplo.com'
      });

      const response = await request
        .delete(`/api/receitas/${receitaId}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(response.status).toBe(403);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('não tem permissão');
    });

    it('should return 404 for non-existent recipe', async () => {
      const response = await request
        .delete('/api/receitas/999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('não encontrada');
    });
  });
});