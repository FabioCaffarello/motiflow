# Scripts de Gerenciamento do Motiflow Dashboard

## Scripts Disponíveis

### `start-dashboard.sh`
Inicia o Motiflow Dashboard em modo desenvolvimento.

**Funcionalidades:**
- Verifica e inicia o PostgreSQL se necessário
- Constrói a imagem Docker se necessário
- Inicia o container do dashboard
- **Garante que a versão correta do design system seja instalada** (lê do package.json)
- Exibe informações úteis (URL, comandos para logs, migrations, etc.)

**Uso:**
```bash
./scripts/start-dashboard.sh
```

### `stop-dashboard.sh`
Para o container do Motiflow Dashboard.

**Uso:**
```bash
./scripts/stop-dashboard.sh
```

### `setup-dashboard.sh`
Executa o setup inicial do dashboard (migrations e seed).

**Funcionalidades:**
- **Garante que a versão correta do design system seja instalada**
- Gera o Prisma Client
- Executa migrations do banco de dados
- Popula o banco com dados iniciais (seed)

**Uso:**
```bash
./scripts/setup-dashboard.sh
```

### `rebuild-dashboard.sh`
Reconstrói a imagem Docker do dashboard sem usar cache.

**Quando usar:**
- Após atualizar dependências no `package.json` (especialmente o design system)
- Quando há problemas com versões antigas em cache
- Quando o Dockerfile foi modificado

**Uso:**
```bash
./scripts/rebuild-dashboard.sh
```

### `logs-dashboard.sh`
Visualiza os logs do container do dashboard.

**Uso:**
```bash
# Ver logs
./scripts/logs-dashboard.sh

# Seguir logs em tempo real
./scripts/logs-dashboard.sh --follow
# ou
./scripts/logs-dashboard.sh -f
```

## Gerenciamento do Design System

Os scripts `start-dashboard.sh` e `setup-dashboard.sh` automaticamente garantem que a versão correta do design system seja instalada, lendo a versão especificada no `package.json` do dashboard.

**Exemplo:**
Se o `package.json` contém:
```json
"@fabio.caffarello/react-design-system": "^1.2.1"
```

Os scripts irão instalar exatamente a versão `1.2.1` (removendo os prefixos `^` ou `~`).

**Nota:** Se você atualizar a versão do design system no `package.json`, você pode:
1. Simplesmente reiniciar o dashboard: `./scripts/stop-dashboard.sh && ./scripts/start-dashboard.sh`
2. Ou reconstruir a imagem completamente: `./scripts/rebuild-dashboard.sh`

## Troubleshooting

### Design System não está atualizando

1. **Verificar versão no package.json:**
   ```bash
   grep "@fabio.caffarello/react-design-system" ../../web/motiflow-dashboard/package.json
   ```

2. **Reconstruir imagem sem cache:**
   ```bash
   ./scripts/rebuild-dashboard.sh
   ```

3. **Verificar versão instalada no container:**
   ```bash
   docker exec motiflow-dashboard npm list @fabio.caffarello/react-design-system
   ```

4. **Forçar atualização manual:**
   ```bash
   docker exec motiflow-dashboard npm install @fabio.caffarello/react-design-system@1.2.1
   docker compose --profile dev restart motiflow-dashboard
   ```
