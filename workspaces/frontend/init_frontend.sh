#!/bin/bash
set -e

echo "🚀 Iniciando Vue.js..."

# Verifica se o arquivo .env existe, se não existir e houver .env.example, cria uma cópia
[ ! -f .env ] && [ -f .env.example ] && cp .env.example .env

# Verifica se a pasta node_modules existe, se não existir, instala as dependências
if [ ! -d "node_modules" ]; then
    echo "📦 Pasta node_modules não encontrada. Instalando dependências..."
    npm install
fi

# Inicia o servidor de desenvolvimento
npm run dev -- --host 0.0.0.0 --port 5173