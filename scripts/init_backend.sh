#!/bin/sh

# Define o diretório do projeto
PROJECT_DIR="/app"
cd "$PROJECT_DIR" || { echo "Falha ao acessar o diretório do projeto"; exit 1; }

echo "🤖 Iniciando Backend..."

# Verificar se o arquivo .env existe
if [ ! -f ".env" ]; then
    echo "📋 Arquivo .env não encontrado. Criando a partir de .env.example..."
    cp .env.example .env || { echo "❌ Falha ao criar .env"; exit 1; }
fi

# Verificar se as dependências do NPM estão instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências do NPM..."
    npm update || { echo "❌ Falha ao instalar dependências do NPM"; exit 1; }
else
    echo "✅ Dependências do NPM já instaladas"
fi

echo "🚀 Iniciando Backend com watch mode..."
npx ts-node-dev --respawn --transpile-only src/index.ts || { echo "❌ Falha ao iniciar o servidor"; exit 1; }