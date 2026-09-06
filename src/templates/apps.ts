// Template literal functions for the database package, the server app, and the web app.
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

export const databaseClient = () => `import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
`;

export const databaseIndex = () => `export { prisma } from "./client";
export { PrismaClient } from "@prisma/client";
export * from "@prisma/client";
`;

// main/types: apps/server compiles with module CommonJS and no moduleResolution,
// so TypeScript uses Node10 resolution — which ignores the exports map.
// Prisma pinned, not "latest": latest resolves the CLI to an 8.x rc against
// @prisma/client 7.x, and the mismatched CLI has no `generate` command.
export const databasePackageJson = () => `{
  "name": "@repo/database",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": {
      "import": "./src/index.ts",
      "require": "./src/index.ts"
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

// --- apps/server ---

export const serverIndex = () => `import express from "express";
import cors from "cors";
import { healthRouter } from "./routes/health";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/health", healthRouter);

// Error handler — must be last
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
});

export default app;
`;

export const serverDbConfig = () => `export { prisma } from "@repo/database";
`;

export const serverHealthController = () => `import type { Request, Response } from "express";

export const getHealth = (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
};
`;

export const serverHealthRoute = () => `import { Router } from "express";
import { getHealth } from "../controllers/healthController";

export const healthRouter = Router();

healthRouter.get("/", getHealth);
`;

export const serverAuthMiddleware = () => `import type { Request, Response, NextFunction } from "express";

export interface AuthRequest extends Request {
  userId?: string;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Unauthorised" });
    return;
  }

  // TODO: verify JWT here
  next();
};
`;

export const serverErrorHandler = () => `import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message ?? "Internal server error" });
};
`;

export const serverPackageJson = () => `{
  "name": "server",
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
    "@repo/typescript-config": "*",
    "@repo/eslint-config": "*"
  }
}
`;

export const serverTsConfig = () => `{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "module": "CommonJS",
    "target": "ES2020",
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
    "@repo/eslint-config": "*",
    "eslint": "^8.0.0",
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

export const webEslintConfig = () => `/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ["@repo/eslint-config/next"],
};
`;

// --- root ---

export const envExample = ({ dbName }: { dbName: string }) =>
  `DATABASE_URL="postgresql://postgres:password@localhost:5432/${dbName}"\n`;
