# Código Gourmet - Backend

## Visão Geral

O Código Gourmet é um sistema de cadastro e gerenciamento de receitas culinárias. Este repositório contém o backend da aplicação, desenvolvido com Node.js, TypeScript, Express e MySQL.

O sistema permite:
- Cadastro e autenticação de usuários
- Gerenciamento de categorias de receitas
- Criação, edição, exclusão e busca de receitas
- Filtragem de receitas por categoria e usuário
- Busca textual em receitas

## Tecnologias Utilizadas

- **Node.js** (v20+)
- **TypeScript**
- **Express.js** - Framework web
- **Knex.js** - Query builder SQL
- **Objection.js** - ORM baseado no Knex
- **MySQL** - Banco de dados
- **JWT** - Autenticação
- **Joi** - Validação de dados
- **Swagger** - Documentação da API
- **Jest** - Testes automatizados

## Pré-requisitos

- Node.js (v20+)
- MySQL (v8+)
- npm

## Instalação

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Configure as variáveis de ambiente:
   - Crie um arquivo `.env` na raiz do projeto (ou copie o `.env.example` se disponível)
   - Preencha as variáveis conforme o exemplo abaixo:

   ```
   # Configurações do Servidor
   PORT=3000
   NODE_ENV=development

   # Configurações do Banco de Dados
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=seu_usuario
   DB_PASSWORD=sua_senha
   DB_NAME=codigo_gourmet

   # Configurações de JWT
   JWT_SECRET=sua_chave_secreta
   JWT_EXPIRES_IN=1d
   ```

## Configuração do Banco de Dados

1. Execute as migrações para criar as tabelas:
   ```bash
   npm run migrate
   ```

2. (Opcional) Execute os seeds para popular o banco com dados iniciais:
   ```bash
   npm run seed
   ```

## Executando a Aplicação

### Modo Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

### Modo Produção

1. Compile o código TypeScript:
   ```bash
   npm run build
   ```

2. Execute a aplicação:
   ```bash
   npm start
   ```

## Documentação da API

A documentação da API está disponível através do Swagger UI em:

```
http://localhost:3000/api-docs
```

### Principais Endpoints

#### Autenticação

- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Autenticar usuário
- `GET /api/auth/me` - Obter perfil do usuário autenticado

#### Categorias

- `GET /api/categorias` - Listar todas as categorias
- `GET /api/categorias/:id` - Obter categoria por ID
- `POST /api/categorias` - Criar nova categoria (requer autenticação)
- `PUT /api/categorias/:id` - Atualizar categoria (requer autenticação)
- `DELETE /api/categorias/:id` - Excluir categoria (requer autenticação)

#### Receitas

- `GET /api/receitas` - Listar todas as receitas
- `GET /api/receitas/:id` - Obter receita por ID
- `GET /api/receitas/usuario/:id_usuarios` - Listar receitas por usuário
- `GET /api/receitas/categoria/:id_categorias` - Listar receitas por categoria
- `GET /api/receitas/search` - Buscar receitas (parâmetros: termo_busca, id_usuarios, id_categorias)
- `POST /api/receitas` - Criar nova receita (requer autenticação)
- `PUT /api/receitas/:id` - Atualizar receita (requer autenticação e ser o proprietário)
- `DELETE /api/receitas/:id` - Excluir receita (requer autenticação e ser o proprietário)

### Autenticação

Para endpoints que requerem autenticação, inclua o token JWT no cabeçalho da requisição:

```
Authorization: Bearer seu_token_jwt
```

## Testes

### Estrutura de Testes

```
tests/
├── unit/                  # Testes unitários
│   ├── controllers/       # Testes para controladores
│   ├── services/          # Testes para serviços
│   ├── repositories/      # Testes para repositórios
│   └── middlewares/       # Testes para middlewares
├── integration/           # Testes de integração
│   └── api/               # Testes para endpoints da API
└── setup.ts               # Configuração do ambiente de testes
```

### Tipos de Testes

- **Testes Unitários**: Testam componentes individuais isoladamente. Eles usam mocks para simular as dependências externas.
  - **Controllers**: Testam a lógica dos controladores, verificando se eles processam corretamente as requisições e respostas.
  - **Services**: Testam a lógica de negócio implementada nos serviços.
  - **Repositories**: Testam a camada de acesso a dados, verificando se as operações de banco de dados são executadas corretamente.
  - **Middlewares**: Testam os middlewares que processam as requisições antes de chegarem aos controladores.

- **Testes de Integração**: Testam a interação entre diferentes componentes do sistema. Eles usam um banco de dados de teste real (MySQL) para verificar o comportamento completo da aplicação.
  - **API**: Testam os endpoints da API, verificando se eles retornam as respostas esperadas para diferentes cenários.

- **Testes E2E**: Testam o fluxo completo da API

### Configuração do Ambiente de Testes

Os testes utilizam um banco de dados MySQL dedicado para testes. A configuração está definida no arquivo `knexfile.ts` na raiz do projeto.

O arquivo `setup.ts` contém funções para inicializar e limpar o banco de dados antes e depois dos testes.

### Executando Testes

```bash
# Executar todos os testes
npm test

# Executar testes com cobertura
npm run test:coverage

# Executar apenas os testes unitários
npm run test:unit

# Executar apenas os testes de integração
npm run test:integration

# Executar um arquivo de teste específico
npm test -- tests/unit/controllers/auth.controller.test.ts
```

### Boas Práticas de Testes

1. **Isolamento**: Cada teste deve ser independente e não deve depender do estado deixado por outros testes.
2. **Simplicidade**: Mantenha os testes simples e focados em testar uma única funcionalidade.
3. **Mocks**: Use mocks para isolar o componente sendo testado de suas dependências externas.
4. **Limpeza**: Sempre limpe o banco de dados após os testes para evitar interferência entre testes.
5. **Cobertura**: Tente cobrir todos os caminhos de código, incluindo casos de erro e edge cases.

## Verificação de Saúde

Um endpoint de verificação de saúde está disponível em:

```
GET /health
```

## Estrutura do Projeto

```
backend/
├── docs/                           # Documentação
├── generate-api-yaml.js            # Gerador de YAML para API
├── jest.config.js                  # Configuração do Jest
├── knexfile.ts                     # Configuração do Knex
├── logs/                           # Logs da aplicação
├── migrations/                     # Migrações do banco de dados
├── seeds/                          # Seeds para dados iniciais
├── source/                         # Código fonte da aplicação
│   ├── config/                     # Configurações da aplicação
│   ├── controllers/                # Controladores (camada de apresentação)
│   ├── middlewares/                # Middlewares do Express
│   ├── domain/                     # Camada de domínio (regras de negócio)
│   ├── services/                   # Implementações de serviços (casos de uso)
│   ├── repositories/               # Implementações de repositórios
│   ├── validators/                 # Validadores de entrada
│   ├── routes/                     # Rotas da API
│   ├── utils/                      # Utilitários
│   └── app.ts                      # Ponto de entrada da aplicação
├── swaggerDef.js                   # Definição do Swagger
├── tests/                          # Testes automatizados
│   ├── unit/                       # Testes unitários
│   ├── integration/                # Testes de integração
│   └── setup.ts                    # Configuração do ambiente de testes
└── tsconfig.json                   # Configuração do TypeScript
```
