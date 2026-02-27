#!/bin/bash

# Script para parar o Motiflow Dashboard
# Uso: ./scripts/stop-dashboard.sh

set -e

echo "🛑 Parando Motiflow Dashboard..."

# Verificar se estamos no diretório correto
if [ ! -f "docker-compose.yaml" ]; then
    echo "❌ Erro: Execute este script do diretório infra/docker"
    exit 1
fi

docker compose --profile dev stop motiflow-dashboard

echo "✅ Dashboard parado!"
echo ""
echo "💡 Para iniciar novamente:"
echo "   ./scripts/start-dashboard.sh"
