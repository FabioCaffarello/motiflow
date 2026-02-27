#!/bin/bash

# Script para limpar cache e resolver problemas após atualização do design system
# Uso: ./scripts/fix-design-system-cache.sh

set -e

echo "🔧 Limpando cache do Next.js e Turbopack..."

# Remover cache do Next.js
rm -rf .next
echo "✅ Cache .next removido"

# Remover node_modules do design system (se existir localmente)
if [ -d "../react-design-system/node_modules" ]; then
  echo "⚠️  Design system local encontrado, pulando remoção de node_modules"
else
  # Remover node_modules e reinstalar
  echo "🗑️  Removendo node_modules..."
  rm -rf node_modules
  echo "✅ node_modules removido"
  
  echo "📦 Reinstalando dependências..."
  npm install
  echo "✅ Dependências reinstaladas"
fi

# Limpar cache do npm
echo "🧹 Limpando cache do npm..."
npm cache clean --force
echo "✅ Cache do npm limpo"

echo ""
echo "✨ Limpeza concluída!"
echo ""
echo "Próximos passos:"
echo "1. Execute: npm run dev"
echo "2. Se o erro persistir, reinicie o servidor de desenvolvimento"
echo ""
