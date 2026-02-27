# Motiflow Infrastructure - Docker Compose

Infraestrutura completa do Motiflow usando Docker Compose.

## ⚠️ Configuração Inicial Obrigatória

Antes de iniciar qualquer serviço, configure as variáveis de ambiente:

### 1. Arquivo .env

Crie ou edite o arquivo `.env` no diretório `infra/docker/` com as seguintes variáveis:

```bash
# MinIO Configuration
MINIO_USERNAME=minio
MINIO_PASSWORD=minio123
MINIO_ACCESS_KEY=minio
MINIO_SECRET_KEY=minio123

# AWS Credentials (para compatibilidade com MinIO)
AWS_ACCESS_KEY_ID=minio
AWS_SECRET_ACCESS_KEY=minio123

# PostgreSQL Configuration (⚠️ ADICIONE ESTAS!)
POSTGRES_USER=motiflow
POSTGRES_PASSWORD=motiflow123
POSTGRES_DB=motiflow_dashboard
```

**Importante**: Se você já tem um arquivo `.env` com as variáveis do MinIO, apenas **adicione as 3 variáveis do PostgreSQL** no final.

Veja [ENV_SETUP.md](./ENV_SETUP.md) para mais detalhes.

## 🚀 Serviços Disponíveis

### Serviços Principais

- **postgres** - Banco de dados PostgreSQL para Motiflow Dashboard
- **minio** - Object storage (S3-compatible)
- **spark-connect** - Apache Spark Connect Server
- **motia-flows** - Motia Flows service
- **motia-bridge** - Motia Bridge service
- **synthetic-data-generator** - Gerador de dados sintéticos

### Serviços de Desenvolvimento (Profile: dev)

- **motiflow-dashboard** - Dashboard web em modo desenvolvimento
- **synthetic-data-generator-dev** - Gerador de dados sintéticos (dev mode)

## 📖 Guias Rápidos

### Motiflow Dashboard

```bash
cd infra/docker

# Configurar .env primeiro (veja acima)

# Iniciar
./scripts/start-dashboard.sh

# Setup inicial
./scripts/setup-dashboard.sh

# Acessar
# http://localhost:5001
```

Veja [QUICKSTART_DASHBOARD.md](./QUICKSTART_DASHBOARD.md) para guia completo.

### Todos os Serviços

```bash
cd infra/docker

# Iniciar todos os serviços
docker compose up -d

# Iniciar com serviços de desenvolvimento
docker compose --profile dev up -d

# Ver status
docker compose ps

# Ver logs
docker compose logs -f
```

## 📚 Documentação

- [ENV_SETUP.md](./ENV_SETUP.md) - ⚠️ **Configure variáveis primeiro!**
- [QUICKSTART_DASHBOARD.md](./QUICKSTART_DASHBOARD.md) - Guia rápido do Dashboard
- [DASHBOARD_README.md](./DASHBOARD_README.md) - Resumo da configuração do Dashboard
- [scripts/README.md](./scripts/README.md) - Scripts de desenvolvimento

## 🔧 Comandos Úteis

```bash
# Ver configuração completa
docker compose config

# Rebuild de um serviço
docker compose build <servico>

# Parar todos os serviços
docker compose down

# Parar e remover volumes
docker compose down -v

# Ver logs de um serviço
docker compose logs -f <servico>
```

## 🐛 Troubleshooting

### Variáveis de ambiente não funcionam

1. Verifique se o arquivo `.env` existe e está no diretório correto
2. Verifique se não há espaços ao redor do `=` nas variáveis
3. Veja [ENV_SETUP.md](./ENV_SETUP.md) para mais detalhes

### Porta já em uso

Altere a porta no `docker-compose.yaml` ou pare o serviço que está usando a porta.

### Container não inicia

1. Verifique logs: `docker compose logs <servico>`
2. Verifique dependências: `docker compose ps`
3. Reconstrua a imagem: `docker compose build <servico>`

## 📝 Notas

- O arquivo `.env` está no `.gitignore` e não deve ser commitado
- Use senhas fortes em produção
- Os serviços de desenvolvimento usam o profile `dev`
