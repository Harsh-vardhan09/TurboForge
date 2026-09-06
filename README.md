# create-turbo-stack

One command to scaffold a production-ready Turborepo monorepo.

## Usage

```bash
npx create-turbo-stack my-app
```

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14 + Tailwind CSS |
| Backend | Express + TypeScript |
| Database | Prisma ORM + PostgreSQL |
| Monorepo | Turborepo + pnpm workspaces |
| Shared UI | `@repo/ui` (Button, Card) |
| Shared Config | `@repo/typescript-config`, `@repo/tailwind-config`, `@repo/eslint-config` |

## Structure

```
my-app/
├── apps/
│   ├── web/        # Next.js frontend
│   └── server/     # Express backend
└── packages/
    ├── database/   # Prisma + schema
    ├── ui/         # Shared components
    ├── tailwind-config/
    ├── typescript-config/
    └── eslint-config/
```

## After scaffolding

```bash
cd my-app
cp .env.example .env.local
# add your DATABASE_URL to .env.local
pnpm run dev
```

Database commands live in `packages/database`:

```bash
cd packages/database
pnpm run db:push
pnpm run db:generate
```
