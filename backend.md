# Guia de Correção dos Testes Unitários

Este guia apresenta soluções para todos os problemas identificados nos testes unitários que estão falhando.

## 1. Problemas com Mocks de Funções JWT

### Problema
Os mocks das funções `generateToken` e `verifyToken` não estão sendo chamados.

### Solução
Certifique-se de que os mocks estão sendo aplicados corretamente:

```typescript
// No início do arquivo de teste
import * as jwt from '../../source/config/jwt';

// Mock das funções JWT
jest.mock('../../source/config/jwt', () => ({
  generateToken: jest.fn(),
  verifyToken: jest.fn()
}));

// Nos testes, use os mocks tipados
const mockGenerateToken = jwt.generateToken as jest.MockedFunction<typeof jwt.generateToken>;
const mockVerifyToken = jwt.verifyToken as jest.MockedFunction<typeof jwt.verifyToken>;

// Configure os mocks antes de cada teste
beforeEach(() => {
  mockGenerateToken.mockClear();
  mockVerifyToken.mockClear();
});
```

## 2. Problemas com Banco de Dados nos Testes E2E

### Problema
Erro "table usuarios already exists" ao executar migrações.

### Solução
Modifique o setup do banco de dados para usar uma estratégia de limpeza:

```typescript
// tests/setup.ts
export const setupDatabase = async () => {
  try {
    // Limpe o banco antes de executar migrações
    await db.schema.dropTableIfExists('receitas');
    await db.schema.dropTableIfExists('categorias');
    await db.schema.dropTableIfExists('usuarios');

    // Execute as migrações
    await db.migrate.latest();

    // Execute os seeds se necessário
    await db.seed.run();
  } catch (error) {
    console.error('Error during database setup:', error);
    throw error;
  }
};

// Ou use um banco de dados em memória separado para cada teste
export const setupTestDatabase = async () => {
  const testDb = knex({
    client: 'sqlite3',
    connection: ':memory:',
    useNullAsDefault: true,
    migrations: {
      directory: './migrations'
    }
  });

  await testDb.migrate.latest();
  return testDb;
};
```

## 3. Problemas com Error Middleware

### Problema
O middleware de erro está incluindo informações de stack trace na resposta.

### Solução
Modifique o middleware para não expor informações sensíveis:

```typescript
// source/middlewares/error.middleware.ts
export const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log do erro (para desenvolvimento/debug)
  logger.error(`Error handling request: ${error.message}`, {
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id
  });

  // Resposta para o cliente (sem informações sensíveis)
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      status: RESPONSE_STATUS.ERROR,
      message: error.message
    });
  }

  // Para erros não-operacionais, retorne apenas mensagem genérica
  return res.status(500).json({
    status: RESPONSE_STATUS.ERROR,
    message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
  });
};
```

## 4. Problemas com expect.any() para Classes Customizadas

### Problema
`expect.any(NotFoundError)` falha porque `NotFoundError` não é uma função construtora.

### Solução
Use `expect.objectContaining()` ou `expect.anything()`:

```typescript
// Em vez de:
expect(nextFunction).toHaveBeenCalledWith(expect.any(NotFoundError));

// Use:
expect(nextFunction).toHaveBeenCalledWith(
  expect.objectContaining({
    message: 'Categoria não encontrada',
    statusCode: 404
  })
);

// Ou simplesmente:
expect(nextFunction).toHaveBeenCalled();
expect(nextFunction.mock.calls[0][0]).toBeInstanceOf(NotFoundError);
expect(nextFunction.mock.calls[0][0].message).toBe('Categoria não encontrada');
```

## 5. Problemas com Mocks de Banco de Dados (Knex)

### Problema
`mockDb.mockImplementation is not a function` - o mock do banco não está configurado corretamente.

### Solução
Configure o mock do Knex adequadamente:

```typescript
// tests/unit/repositories/usuario.repository.test.ts
import { UsuarioRepository } from '../../source/repositories/usuario.repository';

// Mock do Knex
const mockQuery = {
  select: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  first: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  returning: jest.fn().mockReturnThis()
};

const mockDb = jest.fn(() => mockQuery);

jest.mock('../../source/config/database', () => ({
  db: mockDb
}));

describe('UsuarioRepository', () => {
  let usuarioRepository: UsuarioRepository;

  beforeEach(() => {
    usuarioRepository = new UsuarioRepository();
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return a user when found', async () => {
      const mockUser = {
        id: 1,
        nome: 'Test User',
        login: 'test@example.com',
        senha: 'hashedPassword'
      };

      mockQuery.first.mockResolvedValue(mockUser);

      const result = await usuarioRepository.findById(1);

      expect(mockDb).toHaveBeenCalledWith('usuarios');
      expect(mockQuery.where).toHaveBeenCalledWith('id', 1);
      expect(result).toEqual(mockUser);
    });
  });
});
```

## 6. Configuração Geral de Testes

### Jest Configuration
Certifique-se de que o `jest.config.js` está configurado corretamente:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      isolatedModules: true
    }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    'source/**/*.ts',
    '!source/index.ts',
    '!source/app.ts',
    '!source/config/**/*.ts',
    '!source/di/**/*.ts',
    '!source/domain/interfaces/**/*.ts',
    '!source/domain/dtos/**/*.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  forceExit: true,
  testTimeout: 10000
};
```

### TypeScript Configuration
Atualize o `tsconfig.json` para incluir a configuração recomendada:

```json
{
  "compilerOptions": {
    "isolatedModules": true,
    // outras configurações...
  }
}
```

## 7. Limpeza de Recursos

### Setup de Teardown
Implemente limpeza adequada de recursos:

```typescript
// tests/setup.ts
import dotenv from 'dotenv';
import knex from 'knex';
import path from 'path';
import { Model } from 'objection';
import supertest from 'supertest';
import app from '../source/app';
import config from '../knexfile';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Force test environment
process.env.NODE_ENV = 'test';

// Initialize knex with the test configuration
const knexInstance = knex(config.test);

// Bind all Models to the knex instance
Model.knex(knexInstance);

// Create a supertest instance for making HTTP requests
export const request = supertest(app);

// Global afterAll hook to ensure all connections are closed
afterAll(async () => {
  try {
    // Close the test database connection
    if (knexInstance && typeof knexInstance.destroy === 'function') {
      await knexInstance.destroy();
    }

    // Close the main application database connection
    const { closeConnection } = require('../source/config/database');
    await closeConnection();

    // Reset the knex instance
    if (Model && typeof Model.knex === 'function') {
      Model.knex(null as any);
    }

    // Add a small delay to allow any pending operations to complete
    await new Promise(resolve => setTimeout(resolve, 100));
  } catch (error) {
    console.error('Error in global afterAll hook:', error);
  }
});
```

## 8. Checklist de Verificação

Antes de executar os testes, verifique:

- [ ] Todos os mocks estão configurados corretamente
- [ ] As importações dos módulos mockados estão corretas
- [ ] O banco de dados de teste está sendo limpo entre execuções
- [ ] Os middlewares não estão expondo informações sensíveis
- [ ] Os testes estão usando a sintaxe correta do Jest
- [ ] As configurações do Jest e TypeScript estão atualizadas
- [ ] Os recursos estão sendo limpos adequadamente

## 9. Comandos Úteis

```bash
# Executar apenas testes unitários
npm test -- --testPathPattern=unit

# Executar apenas testes E2E
npm test -- --testPathPattern=e2e

# Executar testes com cobertura
npm test -- --coverage

# Executar testes em modo watch
npm test -- --watch

# Limpar cache do Jest
npm test -- --clearCache
```

## 10. Troubleshooting Adicional

### Se os testes ainda falharem:

1. **Verifique a ordem dos imports** - Mocks devem ser importados antes dos módulos que os usam
2. **Confirme a estrutura de pastas** - Caminhos relativos devem estar corretos
3. **Verifique versões das dependências** - Certifique-se de que Jest, ts-jest e outras dependências estão compatíveis
4. **Execute testes individuais** - Isole problemas executando arquivos de teste específicos
5. **Verifique logs** - Analise mensagens de erro detalhadamente para identificar problemas específicos

Seguindo este guia, todos os testes unitários devem passar corretamente.
