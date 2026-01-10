# Guia Completo: Configuração Supabase + MCP PostgreSQL

## 🚀 Parte 1: Configurar Supabase

### Passo 1: Criar Projeto no Supabase

1. **Acesse**: https://supabase.com
2. **Login/Cadastro**: Use GitHub, Google ou email
3. **Criar Projeto**:
   - Clique em "New Project"
   - Organization: Crie uma nova ou use existente
   - **Name**: `SINDPLAST`
   - **Database Password**: Escolha uma senha forte (ANOTE!)
   - **Region**: `South America (São Paulo)` (mais próximo)
   - Clique em "Create new project"
   - ⏱️ Aguarde 2-3 minutos

### Passo 2: Obter Credenciais

1. No painel do projeto, vá em **Settings** (⚙️) > **API**
2. Copie as seguintes informações:

```
Project URL: https://xxxxxxxxx.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (SECRETO!)
```

### Passo 3: Configurar Variáveis de Ambiente

Edite o arquivo `sindplast-nextjs/.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Passo 4: Criar Schema do Banco de Dados

1. No Supabase, vá em **SQL Editor** (ícone de código)
2. Clique em "New query"
3. Copie o conteúdo do arquivo `sindplast-nextjs/supabase/migrations/001_initial_schema.sql`
4. Cole no editor
5. Clique em **RUN** (ou F5)
6. ✅ Verifique se todas as tabelas foram criadas em **Database** > **Tables**

### Passo 5: Configurar Autenticação

1. Vá em **Authentication** > **Providers**
2. Habilite **Email**
3. Em **Authentication** > **Settings**:
   - **Enable email confirmations**: DESABILITE (para facilitar testes)
   - **Enable email signups**: HABILITE
   - Salve

### Passo 6: Criar Usuário Admin

1. Vá em **Authentication** > **Users**
2. Clique em "Add user" > "Create new user"
3. Preencha:
   - **Email**: `admin@sindplast.local`
   - **Password**: `Sindplast`
   - **Auto Confirm User**: ✅ MARQUE
4. Clique em "Create user"

### Passo 7: Configurar Storage (para imagens)

1. Vá em **Storage**
2. Clique em "Create a new bucket"
3. Preencha:
   - **Name**: `dependentes-images`
   - **Public bucket**: ✅ MARQUE
4. Clique em "Create bucket"
5. Clique no bucket criado > **Policies**
6. Clique em "New Policy" > "For full customization"
7. Cole esta policy:

```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'dependentes-images' );

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'dependentes-images' AND auth.role() = 'authenticated' );

CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'dependentes-images' AND auth.role() = 'authenticated' );

CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING ( bucket_id = 'dependentes-images' AND auth.role() = 'authenticated' );
```

---

## 🔌 Parte 2: Configurar MCP PostgreSQL

### O que é MCP?

MCP (Model Context Protocol) permite que você conecte diretamente ao banco de dados PostgreSQL do Supabase para executar queries, visualizar dados e gerenciar o banco.

### Passo 1: Obter Credenciais do PostgreSQL

1. No Supabase, vá em **Settings** > **Database**
2. Role até "Connection string"
3. Selecione **URI** e copie a string de conexão:

```
postgresql://postgres.[project-ref]:[password]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
```

4. **IMPORTANTE**: Substitua `[password]` pela senha que você criou no Passo 1

### Passo 2: Configurar MCP no Claude Desktop

Crie/edite o arquivo de configuração do Claude Desktop:

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "postgres-sindplast": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://postgres.[project-ref]:[password]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres"
      ]
    }
  }
}
```

**Substitua**:
- `[project-ref]`: Referência do seu projeto
- `[password]`: Sua senha do banco

### Passo 3: Reiniciar Claude Desktop

1. Feche completamente o Claude Desktop
2. Abra novamente
3. Verifique se o MCP está conectado (ícone de plug no canto)

### Passo 4: Testar Conexão MCP

No Claude, você pode executar queries diretamente:

```sql
-- Listar todas as tabelas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'SINDPLAST';

-- Ver dados de exemplo
SELECT * FROM "SINDPLAST"."Usuarios" LIMIT 5;
```

---

## ✅ Verificação Final

### Checklist Supabase:
- [ ] Projeto criado
- [ ] Credenciais copiadas para `.env.local`
- [ ] Schema SQL executado
- [ ] Tabelas criadas (8 tabelas no schema SINDPLAST)
- [ ] Autenticação configurada
- [ ] Usuário admin criado
- [ ] Storage bucket criado

### Checklist MCP:
- [ ] Connection string obtida
- [ ] `claude_desktop_config.json` configurado
- [ ] Claude Desktop reiniciado
- [ ] Conexão testada

### Testar a Aplicação:

1. **Reinicie o servidor Next.js**:
```bash
# Pare o servidor (Ctrl+C)
npm run dev
```

2. **Acesse**: http://localhost:3000

3. **Faça login**:
   - Usuário: `admin@sindplast.local`
   - Senha: `Sindplast`

4. **Navegue pelas páginas** - agora sem erros!

---

## 🐛 Troubleshooting

### Erro: "Invalid API key"
- Verifique se copiou as chaves corretas
- Certifique-se que não há espaços extras no `.env.local`
- Reinicie o servidor Next.js

### Erro: "relation does not exist"
- Execute novamente o script SQL no Supabase
- Verifique se o schema `SINDPLAST` foi criado

### MCP não conecta
- Verifique a connection string
- Certifique-se que substituiu `[password]` pela senha real
- Teste a conexão diretamente com um cliente PostgreSQL

### Erro de autenticação
- Verifique se o usuário foi criado no Supabase Auth
- Confirme que "Auto Confirm User" estava marcado
- Tente criar o usuário novamente

---

## 📚 Próximos Passos

Após configurar tudo:

1. **Testar CRUD**: Crie sócios, empresas, dependentes
2. **Upload de imagens**: Teste o upload de fotos de dependentes
3. **Relatórios**: Gere relatórios em PDF
4. **Backup**: Use as ferramentas de backup

**Dúvidas?** Me pergunte a qualquer momento!
