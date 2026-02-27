#!/bin/bash

# Script para setup inicial do Motiflow Dashboard
# Executa migrations e seed do banco de dados
# Uso: ./scripts/setup-dashboard.sh

set -e

echo "🔧 Configurando Motiflow Dashboard..."

# Verificar se estamos no diretório correto
if [ ! -f "docker-compose.yaml" ]; then
    echo "❌ Erro: Execute este script do diretório infra/docker"
    exit 1
fi

# Verificar se o container está rodando
if ! docker compose --profile dev ps motiflow-dashboard | grep -q "Up"; then
    echo "⚠️  Dashboard não está rodando. Iniciando..."
    ./scripts/start-dashboard.sh
    echo "⏳ Aguardando dashboard ficar pronto..."
    sleep 5
fi

echo "📦 Garantindo versão correta do design system..."
# Atualizar design system para a versão especificada no package.json
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_JSON="${SCRIPT_DIR}/../../web/motiflow-dashboard/package.json"
if [ -f "$PACKAGE_JSON" ]; then
    DESIGN_SYSTEM_VERSION=$(grep -o '"@fabio.caffarello/react-design-system": "[^"]*"' "$PACKAGE_JSON" | cut -d'"' -f4 | sed 's/[\^~]//g')
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

echo "📦 Gerando Prisma Client..."
docker exec -it motiflow-dashboard npx prisma generate

echo "🗄️  Executando migrations..."
docker exec -it motiflow-dashboard npm run db:migrate

echo "🌱 Executando seed (populando banco com dados iniciais)..."
docker exec -it motiflow-dashboard npm run db:seed

echo ""
echo "✅ Setup concluído!"
echo ""
echo "📊 Acesse: http://localhost:5001"
echo ""
echo "💡 Dica: Para abrir Prisma Studio:"
echo "   docker exec -it motiflow-dashboard npm run db:studio"
