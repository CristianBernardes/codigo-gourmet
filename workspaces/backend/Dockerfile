# Dockerfile otimizado para backend
FROM node:20-alpine

# Definir diretório de trabalho
WORKDIR /app

# Instalar dependências do sistema necessárias para MySQL e compilação
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++ \
    mysql-client \
    netcat-openbsd

# Copiar script
COPY ./init_backend.sh /app/
RUN chmod +x /app/init_backend.sh

# Criar diretório para logs se necessário
RUN mkdir -p /app/logs

# Copiar o restante do código fonte
COPY . .

# Expor porta
EXPOSE 3000

# Executa o container usando shell para interpretar o script
CMD ["sh", "/app/init_backend.sh"]
