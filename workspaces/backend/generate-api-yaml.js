const fs = require('fs');
const path = require('path');
const swaggerJSDoc = require('swagger-jsdoc');
const yaml = require('js-yaml');
const swaggerDef = require('./swaggerDef');

// Initialize Swagger
const options = {
  definition: swaggerDef,
  apis: swaggerDef.apis
};

const swaggerSpec = swaggerJSDoc(options);

// Write to file
fs.writeFileSync(
  path.join(__dirname, 'docs', 'api.yaml'),
  yaml.dump(swaggerSpec)
);

console.log('API documentation generated at docs/api.yaml');
