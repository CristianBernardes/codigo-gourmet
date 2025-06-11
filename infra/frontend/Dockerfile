FROM node:20-alpine

WORKDIR /app

# Instalar dependências
COPY package*.json ./
RUN npm install

# Configurar para ambiente de desenvolvimento
ENV NODE_ENV=development

# Expor porta para o servidor de desenvolvimento Vite
EXPOSE 3000

# Comando para iniciar o servidor de desenvolvimento com hot reload
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
