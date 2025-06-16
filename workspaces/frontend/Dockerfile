# Dockerfile otimizado para docker-compose
FROM node:20-alpine

# Definir diretório de trabalho
WORKDIR /app

# Instalar dependências globais necessárias
RUN apk add --no-cache git

# Copiar script
COPY ./init_frontend.sh /app/
RUN chmod +x /app/init_frontend.sh

# Copiar o restante do código fonte
COPY . .

# Expor porta do Vite
EXPOSE 5173

# Executa o container usando shell para interpretar o script
CMD ["sh", "/app/init_frontend.sh"]
