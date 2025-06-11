# Código Gourmet - Sistema de Cadastro e Gerenciamento de Receitas Culinárias

## 📋 Sobre o Projeto

O Código Gourmet é um sistema web completo para cadastro e gerenciamento de receitas culinárias, oferecendo uma experiência rica para usuários organizarem suas receitas favoritas com funcionalidades avançadas de busca, categorização e impressão.

### Funcionalidades Principais:
- Sistema de autenticação completo (registro, login, logout)
- CRUD completo de receitas com categorização
- Sistema de busca e filtros avançados
- Funcionalidade de impressão otimizada
- Interface responsiva e intuitiva
- API REST documentada

## 🔧 Pré-requisitos

Para executar este projeto, você precisará ter instalado em sua máquina:

- [Git](https://git-scm.com/)
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

## 🚀 Como Executar o Projeto

### Clonando o Repositório

```bash
# Clone o repositório
git clone https://github.com/CristianBernardes/codigo-gourmet.git

# Acesse a pasta do projeto
cd codigo-gourmet
```

### Executando com Docker

O projeto utiliza Docker e Docker Compose para facilitar a configuração do ambiente de desenvolvimento. Siga os passos abaixo para executar:

```bash
# Construa e inicie os containers
docker-compose up -d

# Para visualizar os logs
docker-compose logs -f

# Para parar os containers
docker-compose down
```

### Acessando a Aplicação

Após iniciar os containers, você pode acessar:

- **Frontend**: http://localhost:3000
- **API**: http://localhost:8000
- **Documentação da API**: http://localhost:8000/api-docs

## 🛠️ Tecnologias Utilizadas

### Backend
- Node.js 20+ LTS
- TypeScript 5.0+
- Express.js 4.18+
- Knex.js + Objection.js
- MySQL 8.0+

### Frontend
- Vue.js 3.3+ (Composition API)
- Vite
- TypeScript
- Tailwind CSS

### DevOps e Infraestrutura
- Docker + Docker Compose
- Swagger/OpenAPI 3.0

## 📝 Documentação

Para mais detalhes sobre a implementação técnica, consulte o arquivo `desafio_tecnico.md` na raiz do projeto.

## 📄 Licença

Este projeto está sob a licença [MIT](LICENSE).

---

Desenvolvido por Cristian Anderson Oliveira Bernardes