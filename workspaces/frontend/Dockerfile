# Dockerfile otimizado para docker-compose
FROM node:20-alpine

# Definir diretório de trabalho
WORKDIR /app

# Instalar dependências globais necessárias
RUN apk add --no-cache git

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar o restante do código fonte
COPY . .

# Expor porta do Vite
EXPOSE 5173

# Comando padrão para desenvolvimento
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
