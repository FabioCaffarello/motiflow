# 📦 Setup com Submodule AI_DOCS

## 🔒 Acesso ao AI_DOCS

O `ai_docs` agora é um **repositório privado** e está configurado como submodule do `motiflow`.

**Repositório**: https://github.com/FabioCaffarello/ai-docs (PRIVADO)

---

## 🚀 Setup Inicial

### Para Novos Desenvolvedores

1. **Clone o repositório motiflow**:
   ```bash
   git clone https://github.com/FabioCaffarello/motiflow.git
   cd motiflow
   ```

2. **Inicialize o submodule** (requer acesso ao ai-docs):
   ```bash
   git submodule update --init --recursive
   ```

   ⚠️ **Se você não tiver acesso ao repositório privado**, este comando vai falhar para o `ai_docs`. Entre em contato com o time para solicitar acesso.

### Para Desenvolvedores Existentes

Após fazer `git pull`:

```bash
git submodule update --init --recursive
```

---

## 📝 Trabalhando com o Submodule

### Fazer Mudanças no AI_DOCS

1. **Entre no diretório**:
   ```bash
   cd ai_docs
   ```

2. **Faça suas mudanças**:
   ```bash
   # Edite arquivos...
   git add .
   git commit -m "feat: Sua mudança"
   git push origin main
   ```

3. **Atualize a referência no motiflow**:
   ```bash
   cd ..
   git add ai_docs
   git commit -m "chore: Update ai_docs submodule"
   git push origin main
   ```

### Atualizar para Última Versão

```bash
git submodule update --remote ai_docs
git add ai_docs
git commit -m "chore: Update ai_docs submodule"
git push
```

### Ver Status do Submodule

```bash
git submodule status
```

---

## 🔧 Troubleshooting

### Submodule não inicializa

**Erro**: `fatal: clone of 'https://github.com/FabioCaffarello/ai-docs.git' into submodule path 'ai_docs' failed`

**Solução**: Você não tem acesso ao repositório privado. Solicite acesso ao time.

### Submodule mostra como modificado

**Causa**: O submodule está em um commit diferente do esperado.

**Solução**:
```bash
cd ai_docs
git checkout main
git pull origin main
cd ..
git add ai_docs
git commit -m "chore: Update ai_docs submodule"
```

### Submodule vazio após clone

**Solução**:
```bash
git submodule update --init --recursive
```

---

## 📚 Mais Informações

- [Git Submodules Documentation](https://git-scm.com/book/en/v2/Git-Tools-Submodules)
- [GitHub Submodules Guide](https://docs.github.com/en/repositories/working-with-files/managing-files/using-submodules)

---

**Última Atualização**: 2025-11-20

