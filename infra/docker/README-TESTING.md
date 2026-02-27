# Guia de Testes - Synthetic Data Generator

Este guia explica como testar o synthetic-data-generator usando Docker.

## Pré-requisitos

- Docker e Docker Compose instalados
- Acesso ao diretório do projeto

## Setup Inicial

```bash
# 1. Navegar para o diretório docker
cd infra/docker

# 2. Construir a imagem
make build
# ou
docker-compose build synthetic-data-generator

# 3. Iniciar o serviço
make up-syngen
# ou
docker-compose up -d synthetic-data-generator
```

## Executar Testes

### Teste Completo

```bash
# Executar todos os testes
make test
# ou
./scripts/test-synthetic-data.sh
```

### Testes Individuais

```bash
# Validar configuração
make validate

# Gerar JSON Schema
make schema

# Gerar dados
make generate
```

## Comandos Úteis

### Ver logs
```bash
make logs
# ou
docker-compose logs -f synthetic-data-generator
```

### Abrir shell no container
```bash
make shell
# ou
docker exec -it synthetic-data-generator /bin/bash
```

### Verificar arquivos gerados
```bash
docker exec synthetic-data-generator ls -lh /app/output
docker exec synthetic-data-generator cat /app/output/users.json | head -20
docker exec synthetic-data-generator cat /app/output/users.schema.json
```

## Estrutura de Testes

Os testes verificam:

1. ✅ Validação de configuração YAML
2. ✅ Geração de JSON Schema
3. ✅ Geração de dados sintéticos
4. ✅ Criação de arquivos de saída
5. ✅ Validação de estrutura JSON
6. ✅ Comando init

## Configurações de Teste

As configurações de teste estão em:
- `synthetic-data-generator/examples/configs/basic-users.yaml`
- `synthetic-data-generator/examples/configs/e-commerce.yaml`

## Saídas

Os arquivos gerados ficam em:
- `/app/output/` dentro do container
- Volume Docker: `synthetic-data-output`

Para acessar do host:
```bash
docker volume inspect motiflow-network_synthetic-data-output
```

## Troubleshooting

### Container não inicia
```bash
# Ver logs
docker-compose logs synthetic-data-generator

# Verificar se a imagem foi construída
docker images | grep synthetic-data-generator
```

### Erro de permissão
```bash
# Verificar permissões dos volumes
docker exec synthetic-data-generator ls -la /app/output
```

### Reconstruir do zero
```bash
make clean
make build
make up-syngen
```

## Próximos Passos

Após os testes básicos passarem:
1. Integrar com MinIO para upload de dados
2. Testar integração com Spark Connect
3. Criar workflows Motia com geração de dados
