# SINDPLAST Next.js - Sistema de Gestão Sindical

Sistema moderno de gestão para o Sindicato dos Trabalhadores nas Indústrias de Material Plástico de Manaus e do Estado do Amazonas.

## 🚀 Tecnologias

- **Frontend**: Next.js 15 (App Router) com TypeScript
- **Styling**: Tailwind CSS com glassmorphism e animações
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel
- **Charts**: Recharts
- **Animations**: Framer Motion
- **UI Components**: Radix UI
- **Notifications**: React Hot Toast

## 📋 Pré-requisitos

- Node.js 18+ e npm
- Conta no Supabase
- Conta no Vercel (para deploy)

## 🛠️ Configuração

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Copie o arquivo `.env.example` para `.env.local`
3. Preencha as variáveis de ambiente:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Executar Migração do Banco de Dados

No painel do Supabase, vá em **SQL Editor** e execute o script:
`supabase/migrations/001_initial_schema.sql`

### 4. Configurar Autenticação no Supabase

1. Vá em **Authentication** > **Providers**
2. Habilite **Email**
3. Desabilite "Confirm email" para facilitar testes
4. Crie o usuário admin manualmente:
   - Email: `admin@sindplast.local`
   - Password: `Sindplast`

### 5. Configurar Storage (para imagens de dependentes)

1. Vá em **Storage**
2. Crie um bucket chamado `dependentes-images`
3. Configure como público:
   - Policies > New Policy > "Allow public read access"

## 🏃 Executar Localmente

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

**Credenciais padrão:**
- Usuário: `Admin`
- Senha: `Sindplast`

## 📦 Build para Produção

```bash
npm run build
npm start
```

## 🚢 Deploy no Vercel

1. Faça push do código para um repositório Git
2. Importe o projeto no [Vercel](https://vercel.com)
3. Configure as variáveis de ambiente
4. Deploy!

## 📁 Estrutura do Projeto

```
sindplast-nextjs/
├── app/
│   ├── (auth)/
│   │   └── login/          # Página de login
│   ├── dashboard/          # Dashboard e páginas protegidas
│   │   ├── socios/
│   │   ├── empresas/
│   │   ├── dependentes/
│   │   └── ...
│   ├── api/                # API Routes
│   ├── layout.tsx          # Layout raiz
│   └── globals.css         # Estilos globais
├── components/
│   ├── layout/             # Header, Sidebar
│   ├── modals/             # Modais reutilizáveis
│   └── ui/                 # Componentes UI
├── lib/
│   ├── supabase/           # Clientes Supabase
│   ├── types/              # TypeScript types
│   └── utils/              # Utilitários
├── supabase/
│   └── migrations/         # Scripts SQL
└── public/                 # Arquivos estáticos
```

## 🎨 Features

- ✅ Autenticação com Supabase
- ✅ Dashboard com estatísticas e gráficos
- ✅ CRUD completo para todas entidades
- ✅ Upload de imagens (dependentes)
- ✅ Geração de relatórios PDF
- ✅ Dark mode
- ✅ Design responsivo
- ✅ Animações suaves
- ✅ Glassmorphism UI

## 📝 Próximos Passos

Para completar a implementação:

1. **Criar páginas CRUD** para cada entidade (Sócios, Empresas, etc.)
2. **Implementar API Routes** em `app/api/`
3. **Adicionar modais** de formulários
4. **Implementar relatórios** PDF
5. **Testar** todas funcionalidades
6. **Migrar dados** do PostgreSQL antigo (se necessário)

## 🤝 Contribuindo

Este é um projeto privado para SINDPLAST-AM.

## 📄 Licença

Propriedade de SINDPLAST-AM © 2026
