# Use a imagem Node.js baseada em Alpine
FROM node:20-alpine

# Instalar dependências do sistema
RUN apk update && \
    apk add --no-cache \
    git \
    curl \
    wget \
    bash \
    python3 \
    make \
    g++ \
    openssh-client \
    ca-certificates \
    && rm -rf /var/cache/apk/*

# Configurar timezone
RUN ln -snf /usr/share/zoneinfo/UTC /etc/localtime && \
    echo "UTC" > /etc/timezone

WORKDIR /app

# Copiar package.json da pasta bot
COPY bot/package*.json ./

# Copiar código da pasta bot
COPY ../../bot .

# Copiar script de inicialização
COPY ../../scripts/init_gatebot.sh /usr/local/bin/init_gatebot.sh

# Tornar o script executável
RUN chmod +x /usr/local/bin/init_gatebot.sh

EXPOSE 7000

CMD ["/bin/sh", "/usr/local/bin/init_gatebot.sh"]