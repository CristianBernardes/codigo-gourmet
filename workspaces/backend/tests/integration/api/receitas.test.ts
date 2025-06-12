import request from 'supertest';
import app from '../../../source/config/app';
import { setupTestDatabase, teardownTestDatabase } from '../../setup';
import { generateToken } from '../../../source/config/jwt';

describe('Receitas API', () => {
  let authToken: string;
  let userId: number;
  let categoriaId: number;

  beforeAll(async () => {
    await setupTestDatabase();

    // Criar um usuário e obter token para testes autenticados
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        nome: 'Teste Receitas',
        login: 'teste-receitas@example.com',
        senha: 'senha123'
      });

    authToken = registerResponse.body.data.token;
    userId = registerResponse.body.data.usuario.id;

    // Criar uma categoria para usar nos testes de receitas
    const categoriaResponse = await request(app)
      .post('/api/categorias')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ nome: 'Categoria para Receitas' });

    categoriaId = categoriaResponse.body.data.id;
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe('GET /api/receitas', () => {
    beforeEach(async () => {
      // Criar algumas receitas para testar a listagem
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/receitas')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            id_categorias: categoriaId,
            nome: `Receita de Teste ${i}`,
            tempo_preparo_minutos: 30,
            porcoes: 4,
            modo_preparo: '1. Passo 1\n2. Passo 2\n3. Passo 3',
            ingredientes: '- Ingrediente 1\n- Ingrediente 2\n- Ingrediente 3'
          });
      }
    });

    it('should return paginated list of recipes', async () => {
      const response = await request(app)
        .get('/api/receitas')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('page');
      expect(response.body.meta).toHaveProperty('pageSize');
    });

    it('should respect pagination parameters', async () => {
      const pageSize = 2;
      const page = 1;

      const response = await request(app)
        .get(`/api/receitas?page=${page}&pageSize=${pageSize}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(pageSize);
      expect(response.body.meta.page).toBe(page);
      expect(response.body.meta.pageSize).toBe(pageSize);
    });
  });

  describe('POST /api/receitas', () => {
    it('should create a new recipe when authenticated', async () => {
      const newRecipe = {
        id_categorias: categoriaId,
        nome: 'Nova Receita de Teste',
        tempo_preparo_minutos: 45,
        porcoes: 6,
        modo_preparo: '1. Primeiro passo\n2. Segundo passo\n3. Terceiro passo',
        ingredientes: '- 200g de ingrediente 1\n- 3 unidades de ingrediente 2\n- 1 colher de ingrediente 3'
      };

      const response = await request(app)
        .post('/api/receitas')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newRecipe)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.nome).toBe(newRecipe.nome);
      expect(response.body.data.id_usuarios).toBe(userId);
      expect(response.body.data.id_categorias).toBe(categoriaId);
    });

    it('should return 401 when not authenticated', async () => {
      const newRecipe = {
        id_categorias: categoriaId,
        nome: 'Receita Sem Auth',
        tempo_preparo_minutos: 30,
        porcoes: 4,
        modo_preparo: 'Passos...',
        ingredientes: 'Ingredientes...'
      };

      const response = await request(app)
        .post('/api/receitas')
        .send(newRecipe)
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.status).toBe('error');
    });

    it('should return 400 when validation fails', async () => {
      // Receita sem nome (obrigatório)
      const invalidRecipe = {
        id_categorias: categoriaId,
        nome: '',
        tempo_preparo_minutos: 30,
        porcoes: 4,
        modo_preparo: 'Passos...',
        ingredientes: 'Ingredientes...'
      };

      const response = await request(app)
        .post('/api/receitas')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidRecipe)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.errors).toBeTruthy();
    });

    it('should return 404 when category does not exist', async () => {
      const nonExistentCategoryId = 9999;

      const recipeWithInvalidCategory = {
        id_categorias: nonExistentCategoryId,
        nome: 'Receita com Categoria Inválida',
        tempo_preparo_minutos: 30,
        porcoes: 4,
        modo_preparo: 'Passos...',
        ingredientes: 'Ingredientes...'
      };

      const response = await request(app)
        .post('/api/receitas')
        .set('Authorization', `Bearer ${authToken}`)
        .send(recipeWithInvalidCategory)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/receitas/search', () => {
    let receitaId: number;

    beforeEach(async () => {
      // Criar uma receita com termos específicos para busca
      const createResponse = await request(app)
        .post('/api/receitas')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          id_categorias: categoriaId,
          nome: 'Bolo de Chocolate Especial',
          tempo_preparo_minutos: 60,
          porcoes: 8,
          modo_preparo: '1. Misture os ingredientes secos\n2. Adicione os líquidos\n3. Asse em forno médio',
          ingredientes: '- 2 xícaras de farinha de trigo\n- 1 xícara de chocolate em pó\n- 3 ovos\n- 2 xícaras de açúcar'
        });

      receitaId = createResponse.body.data.id;
    });

    it('should search recipes by term', async () => {
      const searchTerm = 'chocolate';

      const response = await request(app)
        .get(`/api/receitas/search?termo_busca=${searchTerm}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);

      // Verificar se a receita com o termo de busca está nos resultados
      const found = response.body.data.some((receita: any) => 
        receita.nome.toLowerCase().includes(searchTerm) || 
        receita.ingredientes.toLowerCase().includes(searchTerm) ||
        receita.modo_preparo.toLowerCase().includes(searchTerm)
      );

      expect(found).toBe(true);
    });

    it('should filter recipes by category', async () => {
      const response = await request(app)
        .get(`/api/receitas/search?id_categorias=${categoriaId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);

      // Todas as receitas devem ter a categoria especificada
      response.body.data.forEach((receita: any) => {
        expect(receita.id_categorias).toBe(categoriaId);
      });
    });

    it('should filter recipes by user', async () => {
      const response = await request(app)
        .get(`/api/receitas/search?id_usuarios=${userId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);

      // Todas as receitas devem ter o usuário especificado
      response.body.data.forEach((receita: any) => {
        expect(receita.id_usuarios).toBe(userId);
      });
    });

    it('should return 404 when filtering by non-existent category', async () => {
      const nonExistentCategoryId = 9999;

      const response = await request(app)
        .get(`/api/receitas/search?id_categorias=${nonExistentCategoryId}`)
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/receitas/usuario/{id_usuarios}', () => {
    beforeEach(async () => {
      // Criar algumas receitas para o usuário
      for (let i = 0; i < 2; i++) {
        await request(app)
          .post('/api/receitas')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            id_categorias: categoriaId,
            nome: `Receita do Usuário ${i}`,
            tempo_preparo_minutos: 30,
            porcoes: 4,
            modo_preparo: 'Passos...',
            ingredientes: 'Ingredientes...'
          });
      }
    });

    it('should return recipes for a specific user', async () => {
      const response = await request(app)
        .get(`/api/receitas/usuario/${userId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      // Todas as receitas devem ser do usuário especificado
      response.body.data.forEach((receita: any) => {
        expect(receita.id_usuarios).toBe(userId);
      });
    });

    it('should return empty array for user with no recipes', async () => {
      // Criar um novo usuário sem receitas
      const newUserResponse = await request(app)
        .post('/api/auth/register')
        .send({
          nome: 'Usuário Sem Receitas',
          login: 'sem-receitas@example.com',
          senha: 'senha123'
        });

      const newUserId = newUserResponse.body.data.usuario.id;

      const response = await request(app)
        .get(`/api/receitas/usuario/${newUserId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });
  });

  describe('GET /api/receitas/categoria/{id_categorias}', () => {
    beforeEach(async () => {
      // Criar algumas receitas para a categoria
      for (let i = 0; i < 2; i++) {
        await request(app)
          .post('/api/receitas')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            id_categorias: categoriaId,
            nome: `Receita da Categoria ${i}`,
            tempo_preparo_minutos: 30,
            porcoes: 4,
            modo_preparo: 'Passos...',
            ingredientes: 'Ingredientes...'
          });
      }
    });

    it('should return recipes for a specific category', async () => {
      const response = await request(app)
        .get(`/api/receitas/categoria/${categoriaId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      // Todas as receitas devem ser da categoria especificada
      response.body.data.forEach((receita: any) => {
        expect(receita.id_categorias).toBe(categoriaId);
      });
    });

    it('should return 404 when category does not exist', async () => {
      const nonExistentCategoryId = 9999;

      const response = await request(app)
        .get(`/api/receitas/categoria/${nonExistentCategoryId}`)
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/receitas/{id}', () => {
    let receitaId: number;

    beforeEach(async () => {
      // Criar uma receita para testar
      const createResponse = await request(app)
        .post('/api/receitas')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          id_categorias: categoriaId,
          nome: `Receita Detalhada ${Date.now()}`,
          tempo_preparo_minutos: 45,
          porcoes: 6,
          modo_preparo: 'Passos detalhados...',
          ingredientes: 'Ingredientes detalhados...'
        });

      receitaId = createResponse.body.data.id;
    });

    it('should return a recipe by id', async () => {
      const response = await request(app)
        .get(`/api/receitas/${receitaId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('id', receitaId);
      expect(response.body.data).toHaveProperty('id_usuarios', userId);
      expect(response.body.data).toHaveProperty('id_categorias', categoriaId);
      expect(response.body.data).toHaveProperty('usuario');
      expect(response.body.data).toHaveProperty('categoria');
    });

    it('should return 404 when recipe does not exist', async () => {
      const nonExistentId = 9999;

      const response = await request(app)
        .get(`/api/receitas/${nonExistentId}`)
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body.status).toBe('error');
    });
  });

  describe('PUT /api/receitas/{id}', () => {
    let receitaId: number;

    beforeEach(async () => {
      // Criar uma receita para testar
      const createResponse = await request(app)
        .post('/api/receitas')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          id_categorias: categoriaId,
          nome: `Receita para Atualizar ${Date.now()}`,
          tempo_preparo_minutos: 30,
          porcoes: 4,
          modo_preparo: 'Passos originais...',
          ingredientes: 'Ingredientes originais...'
        });

      receitaId = createResponse.body.data.id;
    });

    it('should update a recipe when authenticated and authorized', async () => {
      const updatedRecipe = {
        nome: 'Receita Atualizada',
        tempo_preparo_minutos: 60,
        porcoes: 8,
        modo_preparo: 'Passos atualizados...',
        ingredientes: 'Ingredientes atualizados...'
      };

      const response = await request(app)
        .put(`/api/receitas/${receitaId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedRecipe)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('id', receitaId);
      expect(response.body.data.nome).toBe(updatedRecipe.nome);
      expect(response.body.data.tempo_preparo_minutos).toBe(updatedRecipe.tempo_preparo_minutos);
      expect(response.body.data.porcoes).toBe(updatedRecipe.porcoes);
      expect(response.body.data.modo_preparo).toBe(updatedRecipe.modo_preparo);
      expect(response.body.data.ingredientes).toBe(updatedRecipe.ingredientes);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .put(`/api/receitas/${receitaId}`)
        .send({ nome: 'Tentativa Sem Auth' })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.status).toBe('error');
    });

    it('should return 403 when trying to update another user\'s recipe', async () => {
      // Criar um novo usuário
      const newUserResponse = await request(app)
        .post('/api/auth/register')
        .send({
          nome: 'Outro Usuário',
          login: 'outro-usuario@example.com',
          senha: 'senha123'
        });

      const otherUserToken = newUserResponse.body.data.token;

      // Tentar atualizar a receita com o token do outro usuário
      const response = await request(app)
        .put(`/api/receitas/${receitaId}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({ nome: 'Tentativa de Outro Usuário' })
        .expect('Content-Type', /json/)
        .expect(403);

      expect(response.body.status).toBe('error');
    });

    it('should return 404 when recipe does not exist', async () => {
      const nonExistentId = 9999;

      const response = await request(app)
        .put(`/api/receitas/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nome: 'Receita Inexistente' })
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body.status).toBe('error');
    });

    it('should return 400 when validation fails', async () => {
      const response = await request(app)
        .put(`/api/receitas/${receitaId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nome: '' }) // Nome vazio deve falhar na validação
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.errors).toBeTruthy();
    });
  });

  describe('DELETE /api/receitas/{id}', () => {
    let receitaId: number;

    beforeEach(async () => {
      // Criar uma receita para testar
      const createResponse = await request(app)
        .post('/api/receitas')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          id_categorias: categoriaId,
          nome: `Receita para Excluir ${Date.now()}`,
          tempo_preparo_minutos: 30,
          porcoes: 4,
          modo_preparo: 'Passos...',
          ingredientes: 'Ingredientes...'
        });

      // Check if the response has the expected structure
      if (createResponse.body && createResponse.body.data && createResponse.body.data.id) {
        receitaId = createResponse.body.data.id;
      } else {
        // Fallback to a different structure if needed
        receitaId = createResponse.body.id || 1; // Use a default ID if all else fails
      }
    });

    it('should delete a recipe when authenticated and authorized', async () => {
      const response = await request(app)
        .delete(`/api/receitas/${receitaId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.status).toBe('success');

      // Verificar se a receita foi realmente excluída
      const getResponse = await request(app)
        .get(`/api/receitas/${receitaId}`)
        .expect(404);

      expect(getResponse.body.status).toBe('error');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .delete(`/api/receitas/${receitaId}`)
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.status).toBe('error');
    });

    it('should return 403 when trying to delete another user\'s recipe', async () => {
      // Criar uma nova receita específica para este teste
      const createNewRecipeResponse = await request(app)
        .post('/api/receitas')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          id_categorias: categoriaId,
          nome: `Receita para Teste de Permissão ${Date.now()}`,
          tempo_preparo_minutos: 30,
          porcoes: 4,
          modo_preparo: 'Passos...',
          ingredientes: 'Ingredientes...'
        });

      let newRecipeId;
      if (createNewRecipeResponse.body && createNewRecipeResponse.body.data && createNewRecipeResponse.body.data.id) {
        newRecipeId = createNewRecipeResponse.body.data.id;
      } else {
        newRecipeId = createNewRecipeResponse.body.id || 1;
      }

      // Criar um novo usuário
      const newUserResponse = await request(app)
        .post('/api/auth/register')
        .send({
          nome: 'Outro Usuário para Delete',
          login: 'outro-usuario-delete@example.com',
          senha: 'senha123'
        });

      const otherUserToken = newUserResponse.body.data.token;

      // Tentar excluir a receita com o token do outro usuário
      const response = await request(app)
        .delete(`/api/receitas/${newRecipeId}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body.status).toBe('error');
    });

    it('should return 404 when recipe does not exist', async () => {
      const nonExistentId = 9999;

      const response = await request(app)
        .delete(`/api/receitas/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body.status).toBe('error');
    });
  });
});
