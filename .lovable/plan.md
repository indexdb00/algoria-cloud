# Plano de implementação

Email admin confirmado: **index.db00@gmail.com** (será inserido em `user_roles` como `admin`).

## 1. Landing → Chat-first (estilo Lovable)
- Substituir `src/routes/index.tsx`: remover a landing page atual. Nova home = grande input de chat centralizado ("O que você quer criar hoje?"), header minimalista no topo direito com **Login** / **Cadastrar** + seletor de idioma.
- Ao digitar e enviar (ou clicar em "testar"), abre modal/redirect para `/auth` preservando o prompt (`sessionStorage`), e após login envia automaticamente no chat real.
- Manter `SiteFooter` discreto com links de Termos/LGPD/Cookies.

## 2. Créditos & Planos (base Lovable)
- Cadastro: **50 créditos de boas-vindas + 5 diários** (cron/trigger ao login). Atualizar `handle_new_user` (50) e criar função `grant_daily_credits()` chamada no primeiro login do dia.
- Planos (Stripe):
  - **Starter** — $5/€5 → 100 créditos/mês
  - **Pro** — $20/€20 → 500 créditos/mês
  - **Business** — $50/€50 → 1500 créditos/mês
  - **Enterprise** — sob consulta
- Atualizar `dashboard.billing.tsx` com nova grade + PIX automático (BR).

## 3. Autenticação
- Adicionar **Google** (via `supabase--configure_social_auth`) e **Apple/iCloud** na página `/auth`.
- Botões "Continuar com Google" e "Continuar com Apple" acima do form email/senha.

## 4. Stripe (planos)
- Rodar `payments--recommend_payment_provider` → `payments--enable_stripe_payments`.
- Criar produtos via `batch_create_product` após enable.

## 5. Admin overhaul
- **Perfil admin**: nova aba `/dashboard/admin/profile` para alterar nome, email (`supabase.auth.updateUser`), senha.
- **Claude na chat admin**: trocar modelo em `dashboard.admin.chat.tsx` para `anthropic/claude-sonnet-4.5` via Lovable AI Gateway (já suportado).
- **Suporte (tickets)**: nova aba `/dashboard/admin/support` com lista de tickets, abrir conversa, ver dados do usuário + campanhas.

## 6. Sistema de Suporte (usuário ↔ admin)
- Nova tabela `support_tickets` (protocolo auto-gerado tipo `AUR-2026-000123`, status, assunto) e `support_messages` (chat).
- Botão **"Suporte / Ajuda"** no menu do perfil (sidebar footer) → rota `/dashboard/support` com lista dos tickets do usuário + botão "Novo chamado".
- Página `/dashboard/support/$id`: chat com admin, exibe número de protocolo no topo.
- Admin em `/dashboard/admin/support`: lista todos os tickets (status, usuário, último update), clica → vê conversa + painel lateral com dados do user (perfil) e campanhas (conversations recentes).

## 7. Consumo com cursor
- Em `dashboard.consumo.tsx`, adicionar overlay de **cursor customizado** (círculo neon que segue o mouse + trail) ativo só nessa página, e tooltip dos gráficos seguindo o cursor.

## 8. Histórico de mensagens
- Já existe sidebar com conversas. Garantir que ao clicar numa conversa antiga, `dashboard.chat.tsx` carrega todas mensagens via `messages` table (já implementado — revisar e corrigir scroll/ordem se necessário).

## 9. Tutorial i18n
- `Tutorial.tsx` já usa `useI18n()`. Garantir que TODAS as strings dos steps passem por `t()` e adicionar chaves faltantes em todos 6 idiomas.

## 10. Migração DB
```sql
-- support_tickets + support_messages com RLS
-- user vê os seus; admin (has_role) vê todos
-- protocolo gerado por sequence + trigger
-- grant_daily_credits() function
-- atualizar handle_new_user para 50 créditos
-- inserir admin role para index.db00@gmail.com
```

## Arquivos (≈18)
**Criar**: `src/routes/support.*`, `dashboard.support.*`, `dashboard.admin.profile.tsx`, `dashboard.admin.support.tsx`, `src/components/ConsumoCursor.tsx`, `src/lib/support.functions.ts`.
**Editar**: `index.tsx` (nova home chat), `auth.tsx` (Google/Apple), `dashboard.billing.tsx` (novos planos), `dashboard.admin.chat.tsx` (Claude), `dashboard.admin.tsx` (nova tab), `dashboard.tsx` (botão suporte), `Tutorial.tsx`, `i18n.tsx`.
**Migração**: 1 SQL com tabelas, funções, role admin.

## Custo
Trabalho extenso (~12+ arquivos + migração + Stripe + OAuth). Cobrarei **5 créditos** conforme solicitado.

Posso prosseguir?