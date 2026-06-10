# Plano de Alterações — Algoria

## 1. Pré-login (Landing do Chat)
- Editar `src/routes/index.tsx`: manter o input de chat limpo (remover chips de sugestões automáticas que poluem) e adicionar abaixo uma seção de apresentação com:
  - Carrossel de planos (Starter / Pro / Business) usando `embla-carousel-react` (já incluso no shadcn carousel).
  - Faixa de ícones de integrações (WhatsApp, Google Meet, Teams, Discord, Twitch) usando ícones oficiais via `simple-icons` CDN ou SVG inline.
  - 3 chamadas curtas da plataforma ("Encontre o algoritmo certo", "Agentes autônomos", "Resultados em minutos").

## 2. Logo abstrato azul
- Gerar novo ícone `algoria-mark-v2.png` (abstrato geométrico azul minimalista) via imagegen premium, transparente.
- Substituir referência em `src/components/BrandMark.tsx` e favicon em `src/routes/__root.tsx`.

## 3. Neon padronizado
- Editar `src/styles.css`:
  - Reforçar `--neon` glow tokens (`--neon-glow-sm`, `-md`, `-lg`).
  - Atualizar `.btn-neon-solid`, adicionar `.neon-border`, `.neon-text`, `.neon-chart` utilities.
  - Bordas com `box-shadow: 0 0 12px var(--neon)` consistente.

## 4. Admin Panel (SPA + sidebar)
- Refatorar `src/routes/_authenticated/dashboard.admin.tsx`:
  - Substituir tabs horizontais por **sidebar lateral** própria (componente local, não shadcn Sidebar global, para evitar conflito com layout autenticado).
  - Container `min-h-screen` ocupando viewport completa, sem o shell padrão do dashboard. Para isso, mover rotas admin para fora de `_authenticated/dashboard.*` — criar layout `_authenticated/admin.tsx` separado (rotas `/admin`, `/admin/chat`, etc.). Mas para preservar URLs existentes e evitar quebras, alternativa mais segura: dentro de `dashboard.admin.tsx` aplicar `fixed inset-0 z-40 bg-brand-bg` cobrindo o shell do dashboard.
  - Gráficos com `recharts` estilizados em neon (stroke `var(--neon)`, glow filter SVG).
- Créditos iniciais: alterar trigger `handle_new_user` de 50 → **100** via migration.

## 5. Página Apps (renomear Integrações)
- Criar `src/routes/_authenticated/dashboard.apps.tsx` (não deletar `dashboard.integrations.tsx` ainda para manter compat; pode redirecionar).
- Atualizar menu lateral em `src/routes/_authenticated/dashboard.tsx`: label "Integrações" → "Apps", `to: "/dashboard/apps"`.
- Cards: WhatsApp, Google Meet, Microsoft Teams, Discord, Twitch — ícone SVG oficial (cores da marca), nome, botão "Conectar" (placeholder navegando para config futura).

## 6. Cookies + Idioma
- Editar `src/lib/i18n.tsx`: ao trocar idioma, gravar cookie `algoria_lang=<code>; path=/; max-age=31536000; SameSite=Lax` além do localStorage. Ler cookie no boot SSR-safe.
- Página de Termos: localizar (provavelmente em `src/routes/` ou criar `terms.tsx`). Renderizar texto via `t("terms.body.xxx")` por idioma. Adicionar strings PT/EN/ES/FR ao `i18n.tsx`.

## 7. Vercel / Deploy
- Auditar:
  - `vite.config.ts` usa preset Cloudflare; Vercel exige preset `vercel`. Adicionar `nitro: { preset: process.env.VERCEL ? 'vercel' : 'cloudflare-module' }` via override no `tanstackStart` config.
  - Garantir que `process.env.*` server-side seja lido **dentro** de handlers (já é o padrão).
  - Confirmar que não há imports `node:child_process` ou similares.
  - Adicionar `vercel.json` com framework `vite` e build command `bun run build`.
  - Variáveis: documentar `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `VITE_*` na config.

## Arquivos a criar
- `src/components/PlanCarousel.tsx`
- `src/components/IntegrationStrip.tsx`
- `src/routes/_authenticated/dashboard.apps.tsx`
- `src/components/admin/AdminSidebar.tsx`
- `vercel.json`
- `src/assets/algoria-mark-v2.png.asset.json` (via imagegen + lovable-assets)
- Migration SQL: credits 50→100

## Arquivos a editar
- `src/routes/index.tsx`
- `src/components/BrandMark.tsx`
- `src/routes/__root.tsx`
- `src/styles.css`
- `src/routes/_authenticated/dashboard.admin.tsx` (+ subrotas para usar sidebar)
- `src/routes/_authenticated/dashboard.tsx` (renomear menu)
- `src/lib/i18n.tsx` (cookie sync + traduções termos)
- `vite.config.ts`

## Custo estimado
**Este plano consome ~8 créditos** dada a amplitude (7 frentes, ~15 arquivos, migration, imagegen premium, alterações no router admin).

Confirma para eu executar?
