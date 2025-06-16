#!/bin/bash

# Configuração: Para na primeira falha para evitar execução com erros
set -e

echo "🚀 Iniciando Backend Node.js..."

# ============================================================
# CONFIGURAÇÃO DE AMBIENTE
# ============================================================
# Verifica se existe arquivo de configuração .env
# Se não existir e houver um .env.example, cria uma cópia
# Isso garante que as variáveis de ambiente necessárias estejam disponíveis
[ ! -f .env ] && [ -f .env.example ] && cp .env.example .env

# ============================================================
# INSTALAÇÃO DE DEPENDÊNCIAS
# ============================================================
# Verifica se a pasta node_modules existe
# Se não existir, significa que as dependências não foram instaladas
# Executa npm install para baixar e instalar todos os pacotes necessários
if [ ! -d "node_modules" ]; then
    echo "📦 Pasta node_modules não encontrada. Instalando dependências..."
    npm install
fi

# ============================================================
# PREPARAÇÃO DO BANCO DE DADOS
# ============================================================
# Executa as migrações do banco de dados
# Isso cria/atualiza as tabelas e estruturas necessárias no banco
echo "🗄️ Executando migrações do banco de dados..."
npm run migrate

# Executa o seed do banco de dados
# Isso popula o banco com dados iniciais necessários para o funcionamento
echo "🌱 Populando banco de dados com dados iniciais..."
npm run seed

# ============================================================
# INICIALIZAÇÃO DO SERVIDOR
# ============================================================
# Inicia o servidor backend em modo desenvolvimento
# --host 0.0.0.0: Permite acesso de qualquer IP (útil para containers/VMs)
# --port 3000: Define a porta específica para evitar conflitos
echo "🌐 Iniciando servidor backend na porta 3000..."
npm run dev -- --host 0.0.0.0 --port 3000