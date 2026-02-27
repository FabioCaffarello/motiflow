#!/bin/bash

# Script para limpar cache e resolver problemas após atualização do design system no Docker
# Uso: ./scripts/fix-design-system-cache.sh

set -e

echo "🔧 Limpando cache do Design System v1.3.0 no Docker..."

# Verificar se estamos no diretório correto
if [ ! -f "docker-compose.yaml" ]; then
    echo "❌ Erro: Execute este script do diretório infra/docker"
    exit 1
fi

# Verificar se o container está rodando
if ! docker compose --profile dev ps motiflow-dashboard | grep -q "Up"; then
    echo "⚠️  Container não está rodando. Iniciando..."
    ./scripts/start-dashboard.sh
    sleep 3
fi

echo "🧹 Limpando cache do Next.js dentro do container..."
docker exec motiflow-dashboard rm -rf /app/.next || true
echo "✅ Cache .next removido"

echo "🧹 Limpando cache do npm dentro do container..."
docker exec motiflow-dashboard npm cache clean --force || true
echo "✅ Cache do npm limpo"

echo "📦 Reinstalando dependências..."
docker exec motiflow-dashboard npm install
echo "✅ Dependências reinstaladas"

echo "🔄 Reiniciando container..."
docker compose --profile dev restart motiflow-dashboard

echo "⏳ Aguardando container reiniciar..."
sleep 5

echo ""
echo "✨ Limpeza concluída!"
echo ""
echo "📊 Verifique os logs:"
echo "   docker compose --profile dev logs -f motiflow-dashboard"
echo ""
echo "🌐 Acesse: http://localhost:5001"
echo ""
