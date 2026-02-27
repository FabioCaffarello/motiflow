# Referências de Desenvolvimento

Esta pasta contém submodules Git com repositórios de referência para consulta durante o desenvolvimento.

## React Flow

**Localização:** `react-flow/`

**Repositório:** https://github.com/xyflow/xyflow.git

**Descrição:** Repositório oficial do React Flow (xyflow), contendo o código-fonte completo da biblioteca. Útil para:

- Consultar implementações de componentes
- Entender padrões e convenções
- Referenciar exemplos e casos de uso
- Estudar a arquitetura da biblioteca

**Uso:**
```bash
# Atualizar submodule para a versão mais recente
git submodule update --remote docs/references/react-flow

# Inicializar submodule (se clonar o repo principal)
git submodule update --init --recursive
```

**Estrutura relevante:**
- `packages/react/` - Código fonte do React Flow
- `examples/` - Exemplos de uso
- `packages/react/src/` - Componentes principais
