module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'Código Gourmet API',
    version: '1.0.0',
    description: 'API para o sistema de cadastro e gerenciamento de receitas culinárias',
    contact: {
      name: 'Equipe Código Gourmet',
      email: 'contato@codigogourmet.com'
    },
    license: {
      name: 'ISC',
      url: 'https://opensource.org/licenses/ISC'
    }
  },
  servers: [
    {
      url: process.env.NODE_ENV === 'production' ? 'https://api.codigogourmet.com/api' : 'http://localhost:3000/api',
      description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"'
      }
    }
  },
  apis: ['./source/routes/*.ts', './source/controllers/*.ts', './source/docs/swagger.schemas.ts', './source/routes/*.routes.ts', './source/controllers/*.controller.ts']
};
