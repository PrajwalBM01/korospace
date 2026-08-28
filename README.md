# korospace

**Your thoughts aren't linear. Why should your tools be?**

korospace is a canvas-based AI chat tool. Instead of one scrolling thread, conversations live as nodes on an infinite canvas — branch any answer into its own thread, wire threads together, and every node inherits exactly the context you connected to it. Across models.

> **Status: early access.** The core canvas, branching, context graph, model switching and BYOK are working. See [Status & limitations](#status--limitations) before you rely on it.

---

## Contents

- [What it does](#what-it-does)
- [How context actually works](#how-context-actually-works)
- [Tech stack](#tech-stack)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [Model access: platform vs BYOK](#model-access-platform-vs-byok)
- [Rate limiting](#rate-limiting)
- [Project structure](#project-structure)
- [Database](#database)
- [Deployment](#deployment)
- [Admin](#admin)
- [Status & limitations](#status--limitations)
- [Licence](#licence)

---

## What it does

**Branch instead of scroll.** Select any part of an assistant's reply and hit *Branch*. You get a new chat node, wired to the original, that carries the conversation up to that point plus the text you highlighted. The original thread is untouched.

**Wire context by hand.** Drag from one node to another and the target inherits the source's history. Nodes can have several parents; context flows down the whole ancestor graph, ordered oldest to newest. Cycles are rejected on both the client and the server.

**Node types.**

| Type | What it is |
|---|---|
| **Chat** | A conversation with a model. Pick the model per node. |
| **Text** | A free-text note. Its content becomes reference material for anything downstream. |
| **Web** | Fetch a page into the graph. *Not shipped yet — visible but disabled.* |

**Switch model per node.** Every chat node picks its own model, so you can draft on a cheap one and reason on an expensive one inside the same canvas — with shared context.

**Bring your own key.** Add a provider key (OpenRouter, Anthropic, OpenAI, Google) and unlock that provider's models. Keys are encrypted at rest and never leave the server.

---

## How context actually works

This is the core of the product, so it's worth understanding.

When you send a message on a node, the server:

1. Verifies you own the node (`Node → Canvas → userId`, enforced in the query).
2. Walks **every ancestor** of that node via a depth-first search over the canvas's edges, using a `visited` set so a stray cycle terminates instead of hanging.
3. Loads each ancestor's content, **scoped to the same canvas** so context can never cross a canvas boundary.
4. Assembles them oldest-first into a `<sources>` block in the system prompt.
5. Sends your node's own thread as the actual conversation.

**Branch cut-offs.** When you branch mid-conversation, the edge stores `branchPointMessageId`. That ancestor's history is then sliced at that message, so a branch sees the conversation *as it was* — not whatever the parent said afterwards. The highlighted text rides along in a `<highlight>` block.

The relevant code is [`app/api/chat/helper.ts`](app/api/chat/helper.ts) — `getAncestors`, `getCutoffs` and `getContext`.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack, React Compiler) |
| UI | React 19, Tailwind 4, shadcn/ui + Radix |
| Canvas | [@xyflow/react](https://reactflow.dev) 12 |
| AI | AI SDK 7 — OpenRouter, Anthropic, OpenAI, Google providers |
| Database | Postgres (Neon) via Prisma 7 + `@prisma/adapter-neon` |
| Auth | Better Auth 1.7 (email/password + Google OAuth, admin plugin) |
| Validation | Zod 4, end to end |
| State | Zustand (canvas UI state), React Flow store (graph) |

---

## Quick start

**Prerequisites**

- Node.js **22+** (see `.nvmrc`)
- A Postgres database — [Neon](https://neon.tech) free tier is what this is built against
- An [OpenRouter](https://openrouter.ai) API key
- A Google OAuth client (optional, but sign-in is nicer with it)

```bash
git clone <your-repo-url> korospace
cd korospace
npm ci
```

`npm ci` runs `prisma generate` via `postinstall`, which produces both the Prisma client and the generated Zod schemas into `app/generated/`. That directory is gitignored — a fresh clone will not compile until this has run.

**Configure the environment**

```bash
cp .env.example .env
```

Fill in every required value (see the table below). Two need generating:

```bash
openssl rand -base64 32   # ENCRYPTION_KEY  — must decode to exactly 32 bytes
openssl rand -base64 32   # BETTER_AUTH_SECRET
```

The app validates its whole environment at boot via [`lib/env.ts`](lib/env.ts), wired in through [`instrumentation.ts`](instrumentation.ts). If something is missing you get one clear error listing every problem — not an opaque failure on the first request that needed it.

**Set up the database**

```bash
npm run db:migrate     # apply migrations
npm run models:sync    # populate the model catalog from provider APIs
```

`models:sync` inserts every model it can see with **both access flags off**. Nothing is usable until you enable it in the admin panel — see [Admin](#admin).

**Run it**

```bash
npm run dev
```

Open <http://localhost:3000>. Sign up, and a canvas is created for you automatically. Right-click the canvas to add a node.

---

## Environment variables

| Variable | Required | What it's for |
|---|---|---|
| `DATABASE_URL` | **Yes** | Postgres connection. Use the **pooled** URL on Neon. |
| `DIRECT_URL` | Recommended | Non-pooled URL. Migrations need a session-level advisory lock the pooler can't hold. |
| `ENCRYPTION_KEY` | **Yes** | Master key for BYOK encryption. **32 bytes, base64.** |
| `BETTER_AUTH_SECRET` | **Yes** | Session signing. Min 32 chars. Must differ between environments. |
| `BETTER_AUTH_URL` | **Yes** | Full origin, e.g. `https://korospace.app`. Must be `https` in production. |
| `GOOGLE_CLIENT_ID` | **Yes** | Google OAuth. |
| `GOOGLE_CLIENT_SECRET` | **Yes** | Google OAuth. |
| `OPENROUTER_API_KEY` | **Yes** | Backs every `PLATFORM`-source model. **Set a spend cap on this key.** |
| `CRON_SECRET` | **Yes in production** | Bearer token for `/api/cron/*`. The app refuses to boot in production without it. |
| `ANTHROPIC_API_KEY` | No | Model catalog sync only. Skipped if absent. |
| `OPENAI_API_KEY` | No | Same. |
| `GOOGLE_AI_API_KEY` | No | Same. |

> **Never rotate `ENCRYPTION_KEY` once users have stored keys.** It's an AES-GCM master key — changing it makes every stored BYOK key permanently undecryptable. Rotation needs a re-encryption migration.

---

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build (typechecks as part of the build) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm run db:migrate` | `prisma migrate dev` — **development only** |
| `npm run db:deploy` | `prisma migrate deploy` — production; applies pending migrations, never resets |
| `npm run db:studio` | Prisma Studio |
| `npm run db:generate` | Regenerate the Prisma + Zod clients |
| `npm run models:plan` | Dry run of the catalog sync — fetches and reports, writes nothing |
| `npm run models:sync` | Same, but writes |
| `npm run vercel-build` | `prisma generate && prisma migrate deploy && next build` |

---

## Model access: platform vs BYOK

Every chat request declares a **source**, and the two paths are billed and gated differently.

**`PLATFORM`** — runs on the project's own OpenRouter key. Gated by `ModelRoute.platformEnabled` and by the user's `planTier`: a `FREE` user can only reach models priced at $0. This is the path that costs the operator money, so it carries the daily caps below.

**`BYOK`** — runs on the user's own provider key. Gated by `ModelRoute.byokEnabled` and by whether the user has a key for that provider. Not subject to the daily caps, since the user is paying.

### How BYOK keys are stored

Handled in [`actions/actionHeper.ts`](actions/actionHeper.ts):

- **AES-256-GCM**, with a fresh 12-byte IV per encryption
- Two subkeys derived from `ENCRYPTION_KEY` via **HKDF-SHA256** — one for encryption, one for fingerprinting, so neither can be used in place of the other
- **AAD bound to `userId:provider`**, so a ciphertext cannot be replayed under a different user or provider
- The stored fingerprint is an **HMAC** of the key, not a plain hash — used for deduplication without exposing the key

Keys are decrypted only inside the chat route, only for the request that needs them, and are never returned to the client. The BYOK page loads `select: { provider: true }` — the ciphertext never leaves the database.

### The model catalog

`ModelRoute` is the source of truth for what exists and what's allowed. It's populated by [`lib/models/sync.ts`](lib/models/sync.ts), which fetches from each provider's API, and applied by `applyPlan`:

- New models are created with `platformEnabled: false, byokEnabled: false` — nothing switches itself on
- Updates refresh names, pricing and context windows but **never touch the access flags**
- Models that disappear from a provider are marked `DEPRECATED`; if they come back, `ACTIVE`

A Vercel cron hits `/api/cron/sync-models` every three days ([`vercel.json`](vercel.json)). The endpoint requires `Authorization: Bearer $CRON_SECRET`, compared with `timingSafeEqual`, and returns **404** on a mismatch rather than 403.

---

## Rate limiting

Two independent systems.

**Auth routes** use Better Auth's built-in limiter with `storage: "database"` — memory storage is per-instance and therefore meaningless on serverless. Configured in [`lib/auth.ts`](lib/auth.ts) with tighter custom rules on `/sign-in/email`, `/sign-up/email` and `/forget-password`.

**The chat endpoint** uses a fixed-window counter in [`lib/limits/rate-limit.ts`](lib/limits/rate-limit.ts). The window is encoded into the key as a time bucket, so check-and-increment is a single atomic `INSERT … ON CONFLICT DO UPDATE` — two concurrent requests can't both read a stale count.

Limits live in [`lib/limits/limits.ts`](lib/limits/limits.ts):

| Limit | Scope | Guards |
|---|---|---|
| Burst | Per user, all requests | Server load — applies to BYOK too |
| Per-user daily | Per user, `PLATFORM` only | One user's share of the platform key |
| Global daily | All users combined, `PLATFORM` only | The hard ceiling on platform spend |

The limiter **fails open**: if the database is unreachable, requests are allowed and `ratelimit_unavailable` is logged. The provider-side spend cap is the backstop that can't fail this way — set one.

---

## Project structure

```
app/
  (auth)/            sign in / sign up, shared layout
  admin/models/      model catalog admin (role-gated)
  api/
    auth/[...all]/   Better Auth handler
    chat/            the streaming chat endpoint + context builder
    cron/            model catalog sync
  byok/              provider key management
  chat/[id]/         the canvas
  generated/         Prisma + Zod output (gitignored, created by prisma generate)
actions/             server actions — nodes, edges, chat, keys, models
components/
  reactflow/         node types, model selector, pane context menu
  ui/                shadcn primitives
lib/
  env.ts             boot-time environment validation
  auth.ts            Better Auth config
  limits/            rate limiting
  models/            catalog sync + per-provider fetchers
  chat-registry.ts   one Chat instance per node, shared by node + side sheet
  canvasHelper.ts    cycle detection
prisma/              schema + migrations
types/               Zod schemas shared by client and server
```

**Authorization pattern.** Every server action resolves ownership *inside* the Prisma query rather than as a separate check:

```ts
await prisma.node.update({
  where: { id: nodeId, canvas: { userId: session.user.id } },
  data: { … },
})
```

This can't be raced, and a caller-supplied ID never reaches a query without a `userId` alongside it. `/api/chat` does the same before touching a node, returning **404** rather than 403 so it doesn't confirm the node exists.

**Error handling.** Server actions return `ActionResult` (`{ ok: true, msg } | { ok: false, error }`) instead of throwing — thrown errors from an action called in an event handler don't reach `error.tsx`, and production strips the message anyway. Call sites show a toast and roll back optimistic UI.

---

## Database

Prisma with the Neon serverless adapter. The runtime uses the **pooled** connection; the Prisma CLI uses the **direct** one, configured in [`prisma.config.ts`](prisma.config.ts).

Core models: `Canvas → Node → Message`, with `Edge` joining nodes and carrying the branch point. Cascade deletes are configured throughout, so removing a user cleanly removes their canvases, nodes, edges and messages.

Indexes cover the hot paths — `Node.canvasId`, all three `Edge` foreign keys, and a composite `Message(nodeId, createdAt)` so the per-node history query filters and sorts from one index with no sort step. Postgres does not index foreign keys automatically.

```bash
npm run db:migrate     # create + apply a migration in development
npm run db:deploy      # apply pending migrations in production
npm run db:studio      # browse the data
```

---

## Deployment

Built for Vercel, but nothing here is Vercel-specific except `vercel.json`'s cron block.

1. Set **every** required environment variable — the app will not boot without them
2. `BETTER_AUTH_URL` must be your production `https` origin
3. Generate a **fresh** `BETTER_AUTH_SECRET` for production
4. Add `https://<your-domain>/api/auth/callback/google` to your Google OAuth client's authorised redirect URIs
5. Deploy — `vercel-build` runs `prisma generate && prisma migrate deploy && next build`

> `prisma migrate deploy` runs **before** the new code goes live, so every migration must be compatible with the currently-running version for the overlap. Additive changes are always safe; destructive ones need expand/contract.

---

## Admin

Users with `role = "admin"` get `/admin/models`, where the `platformEnabled` and `byokEnabled` flags are toggled per model. Enforced by `requireAdmin()` in [`lib/admin.ts`](lib/admin.ts), which checks session → user exists → not banned → role, and calls `notFound()` at every failure so the route never reveals itself. The server action re-checks independently.

Promote a user directly:

```sql
UPDATE "user" SET role = 'admin' WHERE email = 'you@example.com';
```

---

## Status & limitations

Honest list of what isn't there yet.

- **One canvas per user.** Created automatically at signup. No canvas list, rename or delete.
- **Desktop only.** The canvas assumes a mouse — right-click to create, drag to connect, text selection to branch. Mobile is not supported yet.
- **No password reset or email verification.** A user who forgets an email/password login has no recovery path. Google sign-in is unaffected.
- **Web nodes are not shipped.** Visible in the menu, disabled. They need SSRF protection and prompt-injection hardening first, since they'd pull third-party content into a system prompt.
- **Context is unbounded.** `getContext` sends every ancestor's full history with no token budget. Deep graphs get expensive and can exceed a model's context window.
- **No tests.** `typecheck` and `lint` are the only automated checks.

---

## Licence

**No licence file — all rights reserved.**

If this repo is public and you want others to use or contribute to it, add a `LICENSE`. MIT is permissive and simple; Apache-2.0 adds an explicit patent grant. If you'd rather keep it proprietary, leave it as is and consider making the repo private.
