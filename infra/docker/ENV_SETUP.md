# Configuração de Variáveis de Ambiente

## Arquivo .env

O arquivo `.env` no diretório `infra/docker/` deve conter as seguintes variáveis:

### MinIO (Object Storage)

```bash
MINIO_USERNAME=minio
MINIO_PASSWORD=minio123
MINIO_ACCESS_KEY=minio
MINIO_SECRET_KEY=minio123
```

### AWS Credentials (para compatibilidade com MinIO)

```bash
AWS_ACCESS_KEY_ID=minio
AWS_SECRET_ACCESS_KEY=minio123
```

### PostgreSQL (Motiflow Dashboard)

```bash
POSTGRES_USER=motiflow
POSTGRES_PASSWORD=motiflow123
POSTGRES_DB=motiflow_dashboard
```

## Setup Inicial

### 1. Copiar arquivo de exemplo

```bash
cd infra/docker
cp .env.example .env
```

### 2. Editar variáveis (se necessário)

Edite o arquivo `.env` e ajuste as variáveis conforme necessário:

```bash
# Para produção, use senhas fortes:
POSTGRES_PASSWORD=sua_senha_segura_aqui
```

### 3. Verificar configuração

```bash
# Verificar se as variáveis estão sendo lidas corretamente
docker compose config | grep POSTGRES
```

## Variáveis por Serviço

### PostgreSQL

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `POSTGRES_USER` | Usuário do banco | `motiflow` |
| `POSTGRES_PASSWORD` | Senha do banco | `motiflow123` |
| `POSTGRES_DB` | Nome do banco | `motiflow_dashboard` |

### MinIO

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `MINIO_USERNAME` | Usuário MinIO | `minio` |
| `MINIO_PASSWORD` | Senha MinIO | `minio123` |
| `MINIO_ACCESS_KEY` | Access Key | `minio` |
| `MINIO_SECRET_KEY` | Secret Key | `minio123` |

## Segurança

⚠️ **Importante**: O arquivo `.env` está no `.gitignore` e não deve ser commitado.

Para produção:
- Use senhas fortes e únicas
- Use variáveis de ambiente do sistema
- Considere usar um gerenciador de secrets (ex: Docker Secrets, Vault)

## Troubleshooting

### Variáveis não estão sendo lidas

1. Verifique se o arquivo `.env` existe:
   ```bash
   ls -la infra/docker/.env
   ```

2. Verifique se está no diretório correto:
   ```bash
   cd infra/docker
   docker compose config
   ```

3. Verifique sintaxe do arquivo (sem espaços ao redor do `=`):
   ```bash
   # ✅ Correto
   POSTGRES_USER=motiflow
   
   # ❌ Incorreto
   POSTGRES_USER = motiflow
   ```

### Erro de conexão com banco

Verifique se as variáveis estão corretas:
```bash
docker compose config | grep DATABASE_URL
```

A URL deve ser:
```
postgresql://motiflow:motiflow123@postgres:5432/motiflow_dashboard
```
