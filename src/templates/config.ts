// Template literal functions for the shared config packages.
// Each returns the full file contents as a string.

export const rootPackageJson = ({ projectName }: { projectName: string }) => `{
  "name": "${projectName}",
  "private": true,
  "packageManager": "npm@10.9.2",
  "workspaces": ["apps/*", "packages/*", "backend/*"],
  "scripts": {
    "build": "turbo build",
    "dev": "turbo dev",
    "lint": "turbo lint"
  },
  "devDependencies": {
    "turbo": "latest"
  }
}
`;

export const turboJson = () => `{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    }
  }
}
`;

// --- packages/typescript-config ---

export const tsConfigBase = () => `{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "moduleDetection": "force"
  }
}
`;

export const tsConfigNextjs = () => `{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "plugins": [{ "name": "next" }],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowJs": true,
    "jsx": "preserve",
    "incremental": true
  }
}
`;

export const tsConfigNode = () => `{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "module": "CommonJS",
    "target": "ES2020",
    "outDir": "dist",
    "rootDir": "src"
  }
}
`;

export const tsConfigPackageJson = () => `{
  "name": "@repo/typescript-config",
  "version": "0.0.0",
  "private": true
}
`;

// --- packages/tailwind-config ---

export const tailwindConfigTs = () => `import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff6ff",
          500: "#3b82f6",
          900: "#1e3a5f",
        },
      },
    },
  },
  plugins: [],
};

export default config;
`;

export const tailwindPackageJson = () => `{
  "name": "@repo/tailwind-config",
  "version": "0.0.0",
  "private": true,
  "main": "./tailwind.config.ts",
  "types": "./tailwind.config.ts",
  "exports": {
    ".": "./tailwind.config.ts"
  },
  "devDependencies": {
    "tailwindcss": "^3.4.0"
  }
}
`;

// --- packages/ui ---

export const uiButton = () => `import * as React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
}

const base =
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:pointer-events-none disabled:opacity-50";

const variants = {
  primary: "bg-brand-500 text-white hover:bg-brand-900",
  secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
  outline:
    "border border-slate-300 bg-transparent text-slate-900 hover:bg-slate-100",
};

const sizes = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={[base, variants[variant], sizes[size], className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
`;

export const uiCard = () => `import * as React from "react";

export function Card({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={["rounded-lg border border-slate-200 bg-white shadow-sm", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}

export function CardHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col space-y-1.5 p-6 pb-2">
      <h3 className="text-lg font-semibold leading-none tracking-tight text-slate-900">
        {title}
      </h3>
      {description ? (
        <p className="text-sm text-slate-500">{description}</p>
      ) : null}
    </div>
  );
}

export function CardContent({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={["p-6 pt-2", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}
`;

export const uiIndex = () => `export { Button } from "./button";
export { Card, CardHeader, CardContent } from "./card";
`;

export const uiPackageJson = () => `{
  "name": "@repo/ui",
  "version": "0.0.0",
  "private": true,
  "exports": {
    ".": {
      "import": "./src/index.ts"
    }
  },
  "devDependencies": {
    "@repo/typescript-config": "*",
    "@repo/tailwind-config": "*",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.0.0",
    "@types/react": "^18.0.0",
    "react": "^18.0.0"
  },
  "peerDependencies": {
    "react": "^18.0.0"
  }
}
`;

export const uiTsConfig = () => `{
  "extends": "@repo/typescript-config/nextjs.json",
  "compilerOptions": {
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
`;
