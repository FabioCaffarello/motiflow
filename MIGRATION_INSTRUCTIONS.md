# 📋 Instruções de Migração - AI_DOCS para Submodule

## 🎯 Situação Atual

- ✅ Repositório `ai-docs` criado no GitHub (privado)
- ✅ Conteúdo commitado localmente
- ⏳ **Aguardando push para o repositório remoto**
- ⏳ **Aguardando configuração do submodule**

---

## 🚀 Passo 1: Verificar/Fazer Push do AI_DOCS

### Opção A: Se o repositório remoto já tem conteúdo

Verifique em: https://github.com/FabioCaffarello/ai-docs

Se já tem commits e arquivos, pule para o **Passo 2**.

### Opção B: Se o repositório está vazio

Você precisa fazer o push. Execute:

```bash
# Verificar se temos um repositório Git com o conteúdo
cd "/Volumes/OWC Express 1M2/Develop/motiflow"

# Se você ainda tem o ai_docs original com .git
if [ -d "ai_docs_backup_20251120_182923/.git" ]; then
    cd ai_docs_backup_20251120_182923
    git remote -v
    # Se o remote estiver configurado, fazer push
    git push -u origin main
else
    # Ou clonar e copiar conteúdo
    cd /tmp
    git clone git@github.com:FabioCaffarello/ai-docs.git
    cd ai-docs
    cp -r "/Volumes/OWC Express 1M2/Develop/motiflow/ai_docs_backup_20251120_182923"/* .
    git add .
    git commit -m "Initial commit: Migrate ai_docs content"
    git push -u origin main
fi
```

**⚠️ Este comando pode pedir autenticação (token ou SSH)**

---

## 🚀 Passo 2: Configurar Submodule no Motiflow

Após confirmar que o repositório remoto tem conteúdo, execute:

```bash
cd "/Volumes/OWC Express 1M2/Develop/motiflow"

# Limpar qualquer referência antiga
rm -rf .git/modules/ai_docs
rm -rf ai_docs

# Adicionar como submodule (SSH - recomendado)
git submodule add -b main git@github.com:FabioCaffarello/ai-docs.git ai_docs

# OU use HTTPS (vai pedir autenticação)
# git submodule add -b main https://github.com/FabioCaffarello/ai-docs.git ai_docs

# Verificar
git submodule status
cat .gitmodules

# Adicionar documentação
git add .gitmodules ai_docs SUBMODULE_SETUP.md

# Commit
git commit -m "feat: Convert ai_docs to private git submodule

- Remove ai_docs from main repository tracking
- Add ai_docs as private git submodule
- Repository: git@github.com:FabioCaffarello/ai-docs.git (PRIVATE)
- This allows motiflow to be public while keeping ai_docs private
- Only users with access to ai-docs repository can use it
- Add SUBMODULE_SETUP.md with setup instructions

BREAKING CHANGE: ai_docs is now a git submodule. Users need to run:
  git submodule update --init --recursive
to initialize the submodule."

# Push
git push origin develop
```

---

## 🚀 Passo 3: Validar

Após o push, teste:

```bash
# Em outro diretório
cd /tmp
git clone https://github.com/FabioCaffarello/motiflow.git motiflow-test
cd motiflow-test
git checkout develop
git submodule update --init --recursive
# Deve funcionar se você tiver acesso ao ai-docs
```

---

## ⚠️ Problemas Comuns

### Erro: "fatal: could not read Username"
**Solução**: Configure autenticação SSH ou use token:
```bash
git config --global credential.helper store
# Ou configure SSH key
```

### Erro: "fatal: You appear to have cloned an empty repository"
**Solução**: O repositório remoto está vazio. Faça o push primeiro (Passo 1).

### Erro: "fatal: A git directory for 'ai_docs' is found locally"
**Solução**: Limpe as referências:
```bash
rm -rf .git/modules/ai_docs
rm -rf ai_docs
```

---

## 📝 Checklist

- [ ] Verificar que https://github.com/FabioCaffarello/ai-docs tem conteúdo
- [ ] Fazer push se necessário (Passo 1)
- [ ] Configurar submodule (Passo 2)
- [ ] Fazer commit e push no motiflow (Passo 2)
- [ ] Validar funcionamento (Passo 3)

---

**Última Atualização**: 2025-11-20

