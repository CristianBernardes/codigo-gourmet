# Testes do Backend

Este diretório contém os testes automatizados para o backend da aplicação. Os testes são divididos em duas categorias principais:

## Estrutura de Testes

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

## Tipos de Testes

### Testes Unitários

Os testes unitários verificam o comportamento de componentes individuais isoladamente. Eles usam mocks para simular as dependências externas.

- **Controllers**: Testam a lógica dos controladores, verificando se eles processam corretamente as requisições e respostas.
- **Services**: Testam a lógica de negócio implementada nos serviços.
- **Repositories**: Testam a camada de acesso a dados, verificando se as operações de banco de dados são executadas corretamente.
- **Middlewares**: Testam os middlewares que processam as requisições antes de chegarem aos controladores.

### Testes de Integração

Os testes de integração verificam a interação entre diferentes componentes do sistema. Eles usam um banco de dados de teste real (MySQL) para verificar o comportamento completo da aplicação.

- **API**: Testam os endpoints da API, verificando se eles retornam as respostas esperadas para diferentes cenários.

## Configuração do Ambiente de Testes

Os testes utilizam um banco de dados MySQL dedicado para testes. A configuração está definida no arquivo `knexfile.ts` na raiz do projeto.

O arquivo `setup.ts` contém funções para inicializar e limpar o banco de dados antes e depois dos testes.

## Executando os Testes

Para executar todos os testes:

```bash
npm test
```

Para executar apenas os testes unitários:

```bash
npm run test:unit
```

Para executar apenas os testes de integração:

```bash
npm run test:integration
```

Para executar um arquivo de teste específico:

```bash
npm test -- tests/unit/controllers/auth.controller.test.ts
```

## Boas Práticas

1. **Isolamento**: Cada teste deve ser independente e não deve depender do estado deixado por outros testes.
2. **Simplicidade**: Mantenha os testes simples e focados em testar uma única funcionalidade.
3. **Mocks**: Use mocks para isolar o componente sendo testado de suas dependências externas.
4. **Limpeza**: Sempre limpe o banco de dados após os testes para evitar interferência entre testes.
5. **Cobertura**: Tente cobrir todos os caminhos de código, incluindo casos de erro e edge cases.