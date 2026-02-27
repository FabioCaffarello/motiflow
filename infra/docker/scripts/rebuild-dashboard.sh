#!/bin/bash

# Script para reconstruir a imagem do Motiflow Dashboard sem cache
# Útil quando há mudanças nas dependências (ex: atualização do design system)
# Uso: ./scripts/rebuild-dashboard.sh

set -e

echo "🔨 Reconstruindo imagem do Motiflow Dashboard (sem cache)..."

# Verificar se estamos no diretório correto
if [ ! -f "docker-compose.yaml" ]; then
    echo "❌ Erro: Execute este script do diretório infra/docker"
    exit 1
fi

# Parar o container se estiver rodando
if docker compose --profile dev ps motiflow-dashboard | grep -q "Up"; then
    echo "🛑 Parando container..."
    docker compose --profile dev stop motiflow-dashboard
fi

# Reconstruir sem cache
echo "🔨 Construindo imagem sem cache..."
docker compose --profile dev build --no-cache motiflow-dashboard

echo "✅ Imagem reconstruída!"
echo ""
echo "💡 Para iniciar o dashboard:"
echo "   ./scripts/start-dashboard.sh"
