# Motiflow Dashboard - Docker Setup

## ✅ Configuração Completa

O Motiflow Dashboard está configurado para rodar em modo desenvolvimento usando Docker Compose.

## 📁 Arquivos Criados

### Docker
- `images/motiflow-dashboard/Dockerfile.dev` - Dockerfile para desenvolvimento
- `docker-compose.yaml` - Serviço `motiflow-dashboard` adicionado (profile: dev)

### Scripts
- `scripts/start-dashboard.sh` - Inicia o dashboard
- `scripts/setup-dashboard.sh` - Setup inicial (migrations + seed)
- `scripts/stop-dashboard.sh` - Para o dashboard
- `scripts/logs-dashboard.sh` - Visualiza logs
- `scripts/README.md` - Documentação dos scripts

### Documentação
- `QUICKSTART_DASHBOARD.md` - Guia rápido de início
- `../../web/motiflow-dashboard/DOCKER_SETUP.md` - Guia detalhado

## 🚀 Como Usar

### Início Rápido

```bash
cd infra/docker

# 1. Iniciar dashboard
./scripts/start-dashboard.sh

# 2. Setup inicial (primeira vez)
./scripts/setup-dashboard.sh

# 3. Acessar
# http://localhost:5001
```

### Comandos Úteis

```bash
# Ver logs
./scripts/logs-dashboard.sh --follow

# Parar
./scripts/stop-dashboard.sh

# Executar migrations
docker exec -it motiflow-dashboard npm run db:migrate

# Executar seed
docker exec -it motiflow-dashboard npm run db:seed

# Prisma Studio
docker exec -it motiflow-dashboard npm run db:studio
```

## 🔧 Configuração

### Variáveis de Ambiente

No arquivo `.env` (em `infra/docker/`):

```bash
POSTGRES_USER=motiflow
POSTGRES_PASSWORD=motiflow123
POSTGRES_DB=motiflow_dashboard
```

### Serviço Docker Compose

```yaml
motiflow-dashboard:
  - Porta: 5001 (mapeada de 5000 do container)
  - Modo: development
  - Hot-reload: habilitado
  - Profile: dev (só inicia com --profile dev)
  - Dependências: postgres (aguarda healthcheck)
```

## 📊 Estrutura

```
infra/docker/
├── docker-compose.yaml          # ✅ Serviço adicionado
├── images/
│   └── motiflow-dashboard/
│       └── Dockerfile.dev       # ✅ Criado
├── scripts/
│   ├── start-dashboard.sh       # ✅ Criado
│   ├── setup-dashboard.sh       # ✅ Criado
│   ├── stop-dashboard.sh        # ✅ Criado
│   ├── logs-dashboard.sh        # ✅ Criado
│   └── README.md                # ✅ Criado
├── QUICKSTART_DASHBOARD.md      # ✅ Criado
└── DASHBOARD_README.md          # ✅ Este arquivo
```

## 🎯 Próximos Passos

1. ✅ Configuração Docker completa
2. ⏳ Testar aplicação rodando
3. ⏳ Validar hot-reload
4. ⏳ Testar conexão com banco
5. ⏳ Executar migrations e seed
6. ⏳ Validar funcionalidades

## 📚 Documentação

- [Quick Start](./QUICKSTART_DASHBOARD.md) - Guia rápido
- [Docker Setup](../../web/motiflow-dashboard/DOCKER_SETUP.md) - Guia detalhado
- [Scripts README](./scripts/README.md) - Documentação dos scripts

## 🐛 Troubleshooting

Veja [DOCKER_SETUP.md](../../web/motiflow-dashboard/DOCKER_SETUP.md#troubleshooting) para troubleshooting detalhado.
