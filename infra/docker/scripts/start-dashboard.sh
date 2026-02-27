#!/bin/bash

# Script para iniciar o Motiflow Dashboard em modo desenvolvimento
# Uso: ./scripts/start-dashboard.sh

set -e

echo "🚀 Iniciando Motiflow Dashboard..."

# Verificar se estamos no diretório correto
if [ ! -f "docker-compose.yaml" ]; then
    echo "❌ Erro: Execute este script do diretório infra/docker"
    exit 1
fi

# Verificar se o PostgreSQL está rodando
echo "📦 Verificando dependências..."
if ! docker compose ps postgres | grep -q "Up"; then
    echo "⚠️  PostgreSQL não está rodando. Iniciando..."
    docker compose up -d postgres
    echo "⏳ Aguardando PostgreSQL ficar pronto..."
    sleep 5
fi

# Iniciar o dashboard
echo "🔨 Construindo imagem do dashboard (se necessário)..."
docker compose --profile dev build motiflow-dashboard

echo "🚀 Iniciando Motiflow Dashboard..."
docker compose --profile dev up -d motiflow-dashboard

echo "⏳ Aguardando dashboard iniciar..."
sleep 3

# Verificar status
if docker compose --profile dev ps motiflow-dashboard | grep -q "Up"; then
    echo "📦 Garantindo versão correta do design system..."
    # Atualizar design system para a versão especificada no package.json
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    PACKAGE_JSON="${SCRIPT_DIR}/../../web/motiflow-dashboard/package.json"
    if [ -f "$PACKAGE_JSON" ]; then
        DESIGN_SYSTEM_VERSION=$(grep -o '"@fabio.caffarello/react-design-system": "[^"]*"' "$PACKAGE_JSON" | cut -d'"' -f4 | sed 's/[\^~=]//g')
        if [ -n "$DESIGN_SYSTEM_VERSION" ]; then
            echo "   Instalando design system versão: $DESIGN_SYSTEM_VERSION"
            docker exec motiflow-dashboard npm install "@fabio.caffarello/react-design-system@${DESIGN_SYSTEM_VERSION}" 2>/dev/null || true
        else
            echo "   Atualizando design system para versão mais recente..."
            docker exec motiflow-dashboard npm install @fabio.caffarello/react-design-system@latest 2>/dev/null || true
        fi
    else
        echo "   ⚠️  package.json não encontrado, atualizando para versão mais recente..."
        docker exec motiflow-dashboard npm install @fabio.caffarello/react-design-system@latest 2>/dev/null || true
    fi
    
    echo "✅ Motiflow Dashboard está rodando!"
    echo ""
    echo "📊 Acesse: http://localhost:5001"
    echo ""
    echo "📝 Para ver os logs:"
    echo "   docker compose --profile dev logs -f motiflow-dashboard"
    echo ""
    echo "🔧 Para executar migrations:"
    echo "   docker exec -it motiflow-dashboard npm run db:migrate"
    echo ""
    echo "🌱 Para executar seed:"
    echo "   docker exec -it motiflow-dashboard npm run db:seed"
else
    echo "❌ Erro ao iniciar o dashboard. Verifique os logs:"
    echo "   docker compose --profile dev logs motiflow-dashboard"
    exit 1
fi
