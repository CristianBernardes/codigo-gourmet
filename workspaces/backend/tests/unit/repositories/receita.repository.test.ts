import { ReceitaRepository } from '../../../source/repositories/receita.repository';
import { Receita, ReceitaEntity } from '../../../source/domain/entities/Receita';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../../source/utils/constants';

// Mock console.error to prevent error messages in test output
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

// Mock the database module
jest.mock('../../../source/config/database', () => {
  // Create mock query builder
  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    whereRaw: jest.fn().mockReturnThis(),
    join: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    first: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    clone: jest.fn().mockReturnThis()
  };

  // Create a mock database function that returns the query builder
  const mockDb = jest.fn().mockReturnValue(mockQueryBuilder);

  // Add the query builder to the mockDb for easy access in tests
  mockDb.queryBuilder = mockQueryBuilder;

  return mockDb;
});

// Import the mocked database
import db from '../../../source/config/database';

describe('ReceitaRepository', () => {
  let receitaRepository: ReceitaRepository;
  let mockQueryBuilder: any;

  // Mock recipe data
  const mockRecipe: Receita = {
    id: 1,
    id_usuarios: 1,
    id_categorias: 1,
    nome: 'Test Recipe',
    tempo_preparo_minutos: 30,
    porcoes: 4,
    modo_preparo: 'Test preparation',
    ingredientes: 'Test ingredients',
    criado_em: new Date(),
    alterado_em: new Date(),
    usuario: {
      id: 1,
      nome: 'Test User',
      login: 'test@example.com',
      senha: ''
    },
    categoria: {
      id: 1,
      nome: 'Test Category'
    }
  };

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Get the mock query builder
    mockQueryBuilder = (db as any).queryBuilder;

    // Create repository instance
    receitaRepository = new ReceitaRepository();
  });

  describe('findById', () => {
    it('should return recipe when found by id', async () => {
      // Arrange
      mockQueryBuilder.first.mockResolvedValue({
        ...mockRecipe,
        usuario_nome: 'Test User',
        usuario_login: 'test@example.com',
        categoria_nome: 'Test Category'
      });

      // Act
      const result = await receitaRepository.findById(1);

      // Assert
      expect(db).toHaveBeenCalledWith('receitas');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('receitas.id', 1);
      expect(mockQueryBuilder.join).toHaveBeenCalledWith('usuarios', 'receitas.id_usuarios', 'usuarios.id');
      expect(mockQueryBuilder.leftJoin).toHaveBeenCalledWith('categorias', 'receitas.id_categorias', 'categorias.id');
      expect(mockQueryBuilder.select).toHaveBeenCalled();
      expect(mockQueryBuilder.first).toHaveBeenCalled();
      expect(result).toBeInstanceOf(ReceitaEntity);
      expect(result).toEqual(expect.objectContaining({
        id: mockRecipe.id,
        nome: mockRecipe.nome,
        usuario: expect.objectContaining({
          id: mockRecipe.usuario.id,
          nome: mockRecipe.usuario.nome
        }),
        categoria: expect.objectContaining({
          id: mockRecipe.categoria.id,
          nome: mockRecipe.categoria.nome
        })
      }));
    });

    it('should return null when recipe is not found by id', async () => {
      // Arrange
      mockQueryBuilder.first.mockResolvedValue(null);

      // Act
      const result = await receitaRepository.findById(999);

      // Assert
      expect(db).toHaveBeenCalledWith('receitas');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('receitas.id', 999);
      expect(mockQueryBuilder.first).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should throw error when database query fails', async () => {
      // Arrange
      const error = new Error('Database error');
      mockQueryBuilder.first.mockRejectedValue(error);

      // Act & Assert
      await expect(receitaRepository.findById(1)).rejects.toThrow('Database error');
      expect(db).toHaveBeenCalledWith('receitas');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('receitas.id', 1);
      expect(mockQueryBuilder.first).toHaveBeenCalled();
    });
  });

  describe('search', () => {
    beforeEach(() => {
      // Setup common mock responses
      mockQueryBuilder.count.mockResolvedValue([{ count: '10' }]);
      mockQueryBuilder.limit.mockReturnThis();
      mockQueryBuilder.offset.mockReturnThis();
      mockQueryBuilder.select.mockReturnThis();

      // Mock the array of recipes returned by the query
      const mockRecipes = [
        {
          ...mockRecipe,
          usuario_nome: 'Test User',
          usuario_login: 'test@example.com',
          categoria_nome: 'Test Category'
        }
      ];

      // Setup the then method to return the mock recipes
      mockQueryBuilder.then = jest.fn().mockImplementation((callback) => {
        return Promise.resolve(callback(mockRecipes));
      });
    });

    it('should search recipes with user filter', async () => {
      // Arrange
      const filtros = {
        id_usuarios: 1,
        page: 1,
        pageSize: 10
      };

      // Act
      const result = await receitaRepository.search(filtros);

      // Assert
      expect(db).toHaveBeenCalledWith('receitas');
      expect(mockQueryBuilder.join).toHaveBeenCalledWith('usuarios', 'receitas.id_usuarios', 'usuarios.id');
      expect(mockQueryBuilder.leftJoin).toHaveBeenCalledWith('categorias', 'receitas.id_categorias', 'categorias.id');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('receitas.id_usuarios', 1);
      expect(mockQueryBuilder.count).toHaveBeenCalledWith({ count: '*' });
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.offset).toHaveBeenCalledWith(0);
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toBeInstanceOf(ReceitaEntity);
      expect(result.totalItems).toBe(10);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
    });

    it('should search recipes with category filter', async () => {
      // Arrange
      const filtros = {
        id_categorias: 1,
        page: 1,
        pageSize: 10
      };

      // Act
      const result = await receitaRepository.search(filtros);

      // Assert
      expect(db).toHaveBeenCalledWith('receitas');
      expect(mockQueryBuilder.join).toHaveBeenCalledWith('usuarios', 'receitas.id_usuarios', 'usuarios.id');
      expect(mockQueryBuilder.leftJoin).toHaveBeenCalledWith('categorias', 'receitas.id_categorias', 'categorias.id');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('receitas.id_categorias', 1);
      expect(mockQueryBuilder.count).toHaveBeenCalledWith({ count: '*' });
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.offset).toHaveBeenCalledWith(0);
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toBeInstanceOf(ReceitaEntity);
    });

    it('should search recipes with search term', async () => {
      // Arrange
      const filtros = {
        termo_busca: 'chocolate',
        page: 1,
        pageSize: 10
      };

      // Act
      const result = await receitaRepository.search(filtros);

      // Assert
      expect(db).toHaveBeenCalledWith('receitas');
      expect(mockQueryBuilder.join).toHaveBeenCalledWith('usuarios', 'receitas.id_usuarios', 'usuarios.id');
      expect(mockQueryBuilder.leftJoin).toHaveBeenCalledWith('categorias', 'receitas.id_categorias', 'categorias.id');
      expect(mockQueryBuilder.whereRaw).toHaveBeenCalledWith(
        'MATCH(receitas.nome, receitas.ingredientes, receitas.modo_preparo) AGAINST(? IN BOOLEAN MODE)',
        ['*chocolate*']
      );
      expect(mockQueryBuilder.count).toHaveBeenCalledWith({ count: '*' });
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.offset).toHaveBeenCalledWith(0);
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toBeInstanceOf(ReceitaEntity);
    });

    it('should search recipes with all filters', async () => {
      // Arrange
      const filtros = {
        id_usuarios: 1,
        id_categorias: 1,
        termo_busca: 'chocolate',
        page: 1,
        pageSize: 10
      };

      // Act
      const result = await receitaRepository.search(filtros);

      // Assert
      expect(db).toHaveBeenCalledWith('receitas');
      expect(mockQueryBuilder.join).toHaveBeenCalledWith('usuarios', 'receitas.id_usuarios', 'usuarios.id');
      expect(mockQueryBuilder.leftJoin).toHaveBeenCalledWith('categorias', 'receitas.id_categorias', 'categorias.id');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('receitas.id_usuarios', 1);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('receitas.id_categorias', 1);
      expect(mockQueryBuilder.whereRaw).toHaveBeenCalledWith(
        'MATCH(receitas.nome, receitas.ingredientes, receitas.modo_preparo) AGAINST(? IN BOOLEAN MODE)',
        ['*chocolate*']
      );
      expect(mockQueryBuilder.count).toHaveBeenCalledWith({ count: '*' });
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.offset).toHaveBeenCalledWith(0);
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toBeInstanceOf(ReceitaEntity);
    });

    it('should use default page and pageSize when not provided', async () => {
      // Arrange
      const filtros = {
        termo_busca: 'chocolate'
      };

      // Act
      const result = await receitaRepository.search(filtros);

      // Assert
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(DEFAULT_PAGE_SIZE);
      expect(mockQueryBuilder.offset).toHaveBeenCalledWith(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(DEFAULT_PAGE_SIZE);
    });

    it('should limit pageSize to MAX_PAGE_SIZE', async () => {
      // Arrange
      const filtros = {
        page: 1,
        pageSize: MAX_PAGE_SIZE + 10
      };

      // Act
      const result = await receitaRepository.search(filtros);

      // Assert
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(MAX_PAGE_SIZE);
      expect(mockQueryBuilder.offset).toHaveBeenCalledWith(0);
      expect(result.pageSize).toBe(MAX_PAGE_SIZE);
    });

    it('should throw error when database query fails', async () => {
      // Arrange
      const filtros = {
        page: 1,
        pageSize: 10
      };

      const error = new Error('Database error');
      mockQueryBuilder.count.mockRejectedValue(error);

      // Act & Assert
      await expect(receitaRepository.search(filtros)).rejects.toThrow('Database error');
      expect(db).toHaveBeenCalledWith('receitas');
      expect(mockQueryBuilder.join).toHaveBeenCalledWith('usuarios', 'receitas.id_usuarios', 'usuarios.id');
      expect(mockQueryBuilder.leftJoin).toHaveBeenCalledWith('categorias', 'receitas.id_categorias', 'categorias.id');
    });
  });

  describe('create', () => {
    it('should create and return a new recipe', async () => {
      // Arrange
      const newRecipe: Partial<Receita> = {
        id_usuarios: 1,
        id_categorias: 1,
        nome: 'New Recipe',
        tempo_preparo_minutos: 45,
        porcoes: 6,
        modo_preparo: 'New preparation',
        ingredientes: 'New ingredients'
      };

      mockQueryBuilder.insert.mockResolvedValue([2]); // Return new ID

      // Mock the findById call that happens after insert
      jest.spyOn(receitaRepository, 'findById').mockResolvedValue({
        ...newRecipe,
        id: 2,
        criado_em: new Date(),
        alterado_em: new Date()
      } as Receita);

      // Act
      const result = await receitaRepository.create(newRecipe as Receita);

      // Assert
      expect(db).toHaveBeenCalledWith('receitas');
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith(expect.objectContaining({
        id_usuarios: newRecipe.id_usuarios,
        id_categorias: newRecipe.id_categorias,
        nome: newRecipe.nome,
        tempo_preparo_minutos: newRecipe.tempo_preparo_minutos,
        porcoes: newRecipe.porcoes,
        modo_preparo: newRecipe.modo_preparo,
        ingredientes: newRecipe.ingredientes,
        criado_em: expect.any(Date),
        alterado_em: expect.any(Date)
      }));

      expect(receitaRepository.findById).toHaveBeenCalledWith(2);
      expect(result).toEqual(expect.objectContaining({
        id: 2,
        nome: newRecipe.nome
      }));
    });

    it('should throw error when database insert fails', async () => {
      // Arrange
      const newRecipe: Partial<Receita> = {
        id_usuarios: 1,
        id_categorias: 1,
        nome: 'New Recipe',
        tempo_preparo_minutos: 45,
        porcoes: 6,
        modo_preparo: 'New preparation',
        ingredientes: 'New ingredients'
      };

      const error = new Error('Database error');
      mockQueryBuilder.insert.mockRejectedValue(error);

      // Act & Assert
      await expect(receitaRepository.create(newRecipe as Receita)).rejects.toThrow('Database error');
      expect(db).toHaveBeenCalledWith('receitas');
      expect(mockQueryBuilder.insert).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update and return the updated recipe', async () => {
      // Arrange
      const updateData: Partial<Receita> = {
        nome: 'Updated Recipe',
        tempo_preparo_minutos: 60
      };

      mockQueryBuilder.update.mockResolvedValue(1); // 1 row affected

      // Mock the findById call that happens after update
      jest.spyOn(receitaRepository, 'findById').mockResolvedValue({
        ...mockRecipe,
        nome: 'Updated Recipe',
        tempo_preparo_minutos: 60,
        alterado_em: new Date()
      } as Receita);

      // Act
      const result = await receitaRepository.update(1, updateData);

      // Assert
      expect(db).toHaveBeenCalledWith('receitas');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ id: 1 });
      expect(mockQueryBuilder.update).toHaveBeenCalledWith(expect.objectContaining({
        nome: updateData.nome,
        tempo_preparo_minutos: updateData.tempo_preparo_minutos,
        alterado_em: expect.any(Date)
      }));

      expect(receitaRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(expect.objectContaining({
        id: 1,
        nome: 'Updated Recipe',
        tempo_preparo_minutos: 60
      }));
    });

    it('should remove related entities from update data', async () => {
      // Arrange
      const updateData: Partial<Receita> = {
        nome: 'Updated Recipe',
        usuario: { id: 1, nome: 'User', login: 'user@example.com', senha: '' },
        categoria: { id: 1, nome: 'Category' }
      };

      mockQueryBuilder.update.mockResolvedValue(1); // 1 row affected

      // Mock the findById call that happens after update
      jest.spyOn(receitaRepository, 'findById').mockResolvedValue({
        ...mockRecipe,
        nome: 'Updated Recipe',
        alterado_em: new Date()
      } as Receita);

      // Act
      const result = await receitaRepository.update(1, updateData);

      // Assert
      expect(db).toHaveBeenCalledWith('receitas');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ id: 1 });

      // Check that usuario and categoria were removed from update data
      const updateCall = mockQueryBuilder.update.mock.calls[0][0];
      expect(updateCall.usuario).toBeUndefined();
      expect(updateCall.categoria).toBeUndefined();
      expect(updateCall.nome).toBe('Updated Recipe');

      expect(receitaRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(expect.objectContaining({
        id: 1,
        nome: 'Updated Recipe'
      }));
    });

    it('should throw error when database update fails', async () => {
      // Arrange
      const updateData: Partial<Receita> = {
        nome: 'Updated Recipe'
      };

      const error = new Error('Database error');
      mockQueryBuilder.update.mockRejectedValue(error);

      // Act & Assert
      await expect(receitaRepository.update(1, updateData)).rejects.toThrow('Database error');
      expect(db).toHaveBeenCalledWith('receitas');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ id: 1 });
      expect(mockQueryBuilder.update).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should return true when recipe is successfully deleted', async () => {
      // Arrange
      mockQueryBuilder.delete.mockResolvedValue(1); // 1 row affected

      // Act
      const result = await receitaRepository.delete(1);

      // Assert
      expect(db).toHaveBeenCalledWith('receitas');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ id: 1 });
      expect(mockQueryBuilder.delete).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when no recipe is deleted', async () => {
      // Arrange
      mockQueryBuilder.delete.mockResolvedValue(0); // 0 rows affected

      // Act
      const result = await receitaRepository.delete(999);

      // Assert
      expect(db).toHaveBeenCalledWith('receitas');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ id: 999 });
      expect(mockQueryBuilder.delete).toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should throw error when database delete fails', async () => {
      // Arrange
      const error = new Error('Database error');
      mockQueryBuilder.delete.mockRejectedValue(error);

      // Act & Assert
      await expect(receitaRepository.delete(1)).rejects.toThrow('Database error');
      expect(db).toHaveBeenCalledWith('receitas');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ id: 1 });
      expect(mockQueryBuilder.delete).toHaveBeenCalled();
    });
  });
});
