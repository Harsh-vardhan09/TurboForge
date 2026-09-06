// Template literal functions for the database package, backend API, and Next.js app.
// Each returns the full file contents as a string.

// --- packages/database ---

export const prismaSchema = () => `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
`;

export const databaseIndex = () => `import { PrismaClient } from "@prisma/client";

// Next.js re-evaluates modules on every HMR reload, so a plain \`new PrismaClient()\`
// leaks a connection pool per edit. Stash one instance on globalThis in dev.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export { PrismaClient };
export * from "@prisma/client";
`;

export const databasePackageJson = () => `{
  "name": "@repo/database",
  "version": "0.0.0",
  "private": true,
  "exports": {
    ".": {
      "import": "./src/index.ts"
    }
  },
  "scripts": {
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "@prisma/client": "^6.1.0"
  },
  "devDependencies": {
    "prisma": "^6.1.0",
    "@repo/typescript-config": "*",
    "typescript": "^5.0.0"
  }
}
`;

export const databaseTsConfig = () => `{
  "extends": "@repo/typescript-config/node.json",
  "include": ["src"]
}
`;

// --- backend/api ---

export const backendIndex = () => `import express from "express";
import cors from "cors";
import { healthRouter } from "./routes/health";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/health", healthRouter);

app.use(errorHandler);

const port = process.env.PORT ?? 4000;

app.listen(port, () => {
  console.log("api listening on http://localhost:" + port);
});
`;

export const backendHealth = () => `import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});
`;

export const backendErrorHandler = () => `import type { ErrorRequestHandler } from "express";

// Four args is what marks this as an error handler to Express — do not trim \`next\`.
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
};
`;

export const backendPackageJson = () => `{
  "name": "api",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "@repo/database": "*"
  },
  "devDependencies": {
    "@types/express": "^4.17.0",
    "@types/cors": "^2.8.0",
    "@types/node": "^20.0.0",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.0.0",
    "@repo/typescript-config": "*"
  }
}
`;

export const backendTsConfig = () => `{
  "extends": "@repo/typescript-config/node.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
`;

// --- apps/web ---

export const webPageTsx = () => `import { Button, Card, CardHeader, CardContent } from "@repo/ui";

export default function Page() {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-slate-900">
        My Turbo App
      </h1>
      <Card>
        <CardHeader title="Welcome" description="Your monorepo is ready" />
        <CardContent>
          <div className="flex gap-3">
            <Button variant="primary">Get Started</Button>
            <Button variant="outline">Learn More</Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
`;

export const webLayoutTsx = ({ projectName }: { projectName: string }) => `import "./globals.css";

export const metadata = {
  title: "${projectName}",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`;

export const webGlobalsCss = () => `@tailwind base;
@tailwind components;
@tailwind utilities;
`;

export const webTailwindConfig = () => `import type { Config } from "tailwindcss";
import sharedConfig from "@repo/tailwind-config";

const config: Config = {
  ...sharedConfig,
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
};

export default config;
`;

export const webPackageJson = ({ projectName: _projectName }: { projectName: string }) => `{
  "name": "web",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "lint": "next lint"
  },
  "dependencies": {
    "@repo/ui": "*",
    "@repo/database": "*",
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@repo/typescript-config": "*",
    "@repo/tailwind-config": "*",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.0.0",
    "postcss": "^8.0.0",
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0"
  }
}
`;

export const webTsConfig = () => `{
  "extends": "@repo/typescript-config/nextjs.json",
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
`;

// .mjs, not .ts: next.config.ts needs Next 15+, and webPackageJson pins Next 14.
export const webNextConfig = () => `/** @type {import("next").NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/ui"],
};

export default nextConfig;
`;

// --- root ---

export const envExample = ({ dbName }: { dbName: string }) =>
  `DATABASE_URL="postgresql://postgres:password@localhost:5432/${dbName}"\n`;
