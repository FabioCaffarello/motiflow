# Synthetic Data Generator - Docker Setup

Este documento descreve como usar o synthetic-data-generator em containers Docker.

## Serviços Disponíveis

### synthetic-data-generator
Serviço de produção com o binário compilado.

**Uso:**
```bash
# Validar configuração
docker exec synthetic-data-generator syngen validate --config /app/config/configs/basic-users.yaml

# Gerar JSON Schema
docker exec synthetic-data-generator syngen schema \
    --config /app/config/configs/basic-users.yaml \
    --output /app/output/users.schema.json

# Gerar dados
docker exec synthetic-data-generator syngen generate \
    --config /app/config/configs/basic-users.yaml \
    --output /app/output
```

### synthetic-data-generator-dev
Serviço de desenvolvimento com código fonte montado para desenvolvimento ativo.

**Uso:**
```bash
# Iniciar serviço de desenvolvimento
docker-compose --profile dev up synthetic-data-generator-dev

# Executar comandos
docker exec synthetic-data-generator-dev cargo run --bin syngen -- validate --config /app/config/configs/basic-users.yaml
```

## Executar Testes

```bash
# Executar script de testes
./scripts/test-synthetic-data.sh
```

## Volumes

- `/app/config`: Configurações YAML (read-only)
- `/app/output`: Dados gerados e schemas (read-write)
- `/app/data`: Datasets de exemplo (read-only)

## Exemplos de Configuração

Configurações de exemplo estão em `synthetic-data-generator/examples/configs/`:

- `basic-users.yaml`: Dataset básico de usuários
- `e-commerce.yaml`: Dataset completo de e-commerce

## Integração com Outros Serviços

O synthetic-data-generator está na mesma rede Docker (`motiflow-network`) que:
- MinIO (S3): Para armazenar dados gerados
- Spark Connect: Para processar dados gerados
- Motia Flows: Para workflows automatizados

## Próximos Passos

1. Integrar com MinIO para upload direto
2. Criar step Motia para geração via workflow
3. Adicionar API REST para geração via HTTP
