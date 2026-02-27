# Quick Start - Synthetic Data Generator

## 🚀 Início Rápido (5 minutos)

### 1. Construir e Iniciar

```bash
cd infra/docker

# Construir imagem
docker-compose build synthetic-data-generator

# Iniciar serviço
docker-compose up -d synthetic-data-generator
```

### 2. Executar Teste Completo

```bash
./scripts/test-synthetic-data.sh
```

### 3. Verificar Resultados

```bash
# Ver arquivos gerados
docker exec synthetic-data-generator ls -lh /app/output

# Ver dados JSON
docker exec synthetic-data-generator head -5 /app/output/users.json

# Ver JSON Schema
docker exec synthetic-data-generator cat /app/output/users.schema.json
```

## 📝 Comandos Principais

```bash
# Validar configuração
docker exec synthetic-data-generator syngen validate \
    --config /app/config/configs/basic-users.yaml

# Gerar JSON Schema
docker exec synthetic-data-generator syngen schema \
    --config /app/config/configs/basic-users.yaml \
    --output /app/output/users.schema.json

# Gerar dados
docker exec synthetic-data-generator syngen generate \
    --config /app/config/configs/basic-users.yaml

# Criar nova configuração
docker exec synthetic-data-generator syngen init \
    --output /app/output/my-config.yaml
```

## 🎯 O que foi implementado?

✅ Sistema completo de configuração YAML  
✅ Geração de JSON Schema obrigatório  
✅ Geradores básicos (Integer, Float, Boolean, DateTime, Uuid)  
✅ Exportadores JSON e CSV com JSON Schema  
✅ CLI completo com 4 comandos  
✅ Ambiente Docker completo  
✅ Scripts de teste automatizados  

## 📚 Documentação Completa

- [README-TESTING.md](./README-TESTING.md) - Guia completo de testes
- [../synthetic-data-generator/TESTING.md](../../synthetic-data-generator/TESTING.md) - Guia de testes do projeto
- [../synthetic-data-generator/IMPLEMENTATION_STATUS.md](../../synthetic-data-generator/IMPLEMENTATION_STATUS.md) - Status de implementação
