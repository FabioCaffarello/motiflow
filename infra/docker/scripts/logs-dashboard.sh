#!/bin/bash

# Script para ver logs do Motiflow Dashboard
# Uso: ./scripts/logs-dashboard.sh [--follow]

set -e

# Verificar se estamos no diretório correto
if [ ! -f "docker-compose.yaml" ]; then
    echo "❌ Erro: Execute este script do diretório infra/docker"
    exit 1
fi

# Se --follow foi passado, seguir logs em tempo real
if [ "$1" == "--follow" ] || [ "$1" == "-f" ]; then
    docker compose --profile dev logs -f motiflow-dashboard
else
    docker compose --profile dev logs motiflow-dashboard
fi
