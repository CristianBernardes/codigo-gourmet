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

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm install

# Criar diretório para logs se necessário
RUN mkdir -p /app/logs

# Adicionar script de espera para o MySQL
COPY <<EOF /wait-for-mysql.sh
#!/bin/sh
set -e

host="\$1"
port="\$2"
shift 2
cmd="\$@"

until nc -z "\$host" "\$port"; do
  echo "Waiting for MySQL at \$host:\$port..."
  sleep 1
done

echo "MySQL is up - executing command"
exec \$cmd
EOF

RUN chmod +x /wait-for-mysql.sh

# Expor porta
EXPOSE 3000

# Comando para esperar o MySQL e iniciar a aplicação
CMD ["/wait-for-mysql.sh", "mysql", "3306", "npm", "run", "dev", "--", "--host", "0.0.0.0"]
