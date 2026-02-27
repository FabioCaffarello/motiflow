# Quick Start - Motiflow Dashboard

Guia rápido para iniciar o Motiflow Dashboard em desenvolvimento.

## 🚀 Início Rápido

```bash
# 1. Navegar para o diretório docker
cd infra/docker

# 2. Configurar variáveis de ambiente (se ainda não fez)
# Adicione ao arquivo .env as variáveis do PostgreSQL:
# POSTGRES_USER=motiflow
# POSTGRES_PASSWORD=motiflow123
# POSTGRES_DB=motiflow_dashboard
# Veja ENV_SETUP.md para mais detalhes

# 3. Iniciar dashboard
./scripts/start-dashboard.sh

# 4. Configurar banco de dados (primeira vez)
./scripts/setup-dashboard.sh

# 5. Acessar aplicação
# http://localhost:5001
```

## ✅ Verificação Rápida

Após iniciar, verifique:

1. **Container rodando:**
   ```bash
   docker compose --profile dev ps
   ```

2. **Logs sem erros:**
   ```bash
   ./scripts/logs-dashboard.sh
   ```

3. **Aplicação acessível:**
   - Abra http://localhost:5001 no navegador

## 📋 Checklist Inicial

- [ ] Docker e Docker Compose instalados
- [ ] Variáveis de ambiente configuradas no `.env`:
  - [ ] `POSTGRES_USER=motiflow`
  - [ ] `POSTGRES_PASSWORD=motiflow123`
  - [ ] `POSTGRES_DB=motiflow_dashboard`
  - [ ] Variáveis do MinIO (já devem estar)
- [ ] PostgreSQL iniciado
- [ ] Dashboard iniciado
- [ ] Migrations executadas
- [ ] Seed executado (opcional)
- [ ] Aplicação acessível em http://localhost:5001

## 🔧 Comandos Essenciais

| Ação | Comando |
|------|---------|
| Iniciar | `./scripts/start-dashboard.sh` |
| Parar | `./scripts/stop-dashboard.sh` |
| Ver logs | `./scripts/logs-dashboard.sh --follow` |
| Setup DB | `./scripts/setup-dashboard.sh` |
| Migrations | `docker exec -it motiflow-dashboard npm run db:migrate` |
| Seed | `docker exec -it motiflow-dashboard npm run db:seed` |
| Prisma Studio | `docker exec -it motiflow-dashboard npm run db:studio` |

## 🐛 Problemas Comuns

### Porta 5000 já em uso

Altere a porta no `docker-compose.yaml`:
```yaml
ports:
  - "5001:5000"  # Use outra porta
```

### Erro de conexão com banco

1. Verifique se PostgreSQL está rodando:
   ```bash
   docker compose ps postgres
   ```

2. Verifique variáveis de ambiente:
   ```bash
   docker compose config | grep DATABASE_URL
   ```

### Hot-reload não funciona

1. Verifique volumes montados:
   ```bash
   docker compose --profile dev config | grep -A 5 volumes
   ```

2. Reinicie o container:
   ```bash
   docker compose --profile dev restart motiflow-dashboard
   ```

## 📚 Documentação Completa

- [ENV Setup](./ENV_SETUP.md) - **⚠️ Configure as variáveis primeiro!**
- [Docker Setup](../../web/motiflow-dashboard/DOCKER_SETUP.md) - Guia detalhado
- [Scripts README](./scripts/README.md) - Documentação dos scripts
- [Setup Guide](../../web/motiflow-dashboard/SETUP.md) - Setup geral

## 🎯 Próximos Passos

1. ✅ Dashboard rodando
2. ⏳ Explorar interface em http://localhost:5001
3. ⏳ Criar primeiro Epic
4. ⏳ Criar Stories e Tasks
5. ⏳ Testar funcionalidades
