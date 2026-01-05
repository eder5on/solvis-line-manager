# Solvis Line Manager

Projeto Next.js 15 com TypeScript, Tailwind e Supabase para gerenciar linhas 3G.

Setup rápido

1. Copie `.env.example` para `.env.local` e preencha as variáveis (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY).
2. Instale dependências: `npm install` ou `pnpm install`.
3. Rode localmente: `npm run dev`.

Criação das tabelas

Use o arquivo `supabase/migrations/init.sql` para executar no seu banco (via psql ou supabase cli).

Notas de deploy (Vercel)

- Configure as variáveis de ambiente no painel do Vercel (as mesmas do .env.example).
- Conte com a integração do Supabase e chaves seguras (service role somente em server-side env vars).

Próximos passos

- Implementar autenticação robusta e RBAC (Master Admin e Usuário).
- Implementar autenticação robusta e RBAC (Master Admin e Usuário).

Como criar um Master Admin (setup inicial):

1. Crie um usuário via painel do Supabase (Auth -> Users) ou registre via app.
2. Abra o banco (SQL editor) e insira um registro na tabela `users` com `user_id` igual ao id do usuário criado e `role = 'master_admin'`.
   Exemplo: INSERT INTO users (user_id, email, full_name, role) VALUES ('<auth-uuid>', 'admin@exemplo.com', 'Admin', 'master_admin');

Aplicando RLS (Row Level Security)

1. Aplique o arquivo `supabase/migrations/rls.sql` utilizando o Supabase SQL editor ou `supabase` CLI.
2. Teste as políticas em um ambiente de staging antes de aplicar em produção. As políticas criadas incluem:
   - `public.is_master_admin()` - helper function to check admin role
   - Policies for `users`, `lines`, `requests`, `invoices`, `line_movements`, `cancel_criteria`, `cancel_evaluation`, `clients`, `units`.
3. Observação: mudanças sensíveis (como alteração de roles) também são verificadas server-side nas rotas (veja `/api/users` e middleware em `src/lib/auth.ts`).

Storage (Faturas)

- Crie um bucket chamado `invoices` no Supabase Storage (pelo painel ou CLI).
- Para criar via CLI: `supabase storage bucket create invoices --public false` (ajuste permissões conforme necessário).
- As faturas enviadas serão salvas em `invoices/<line_id>/<filename>` e um signed URL será retornado para visualização.

- Implementar paginacão server-side e filtros avançados na listagem de linhas.
- Implementar uploads de faturas para Supabase Storage e visualizador inline.
- Agendar avaliação semanal de critérios (cron job/Edge function).
