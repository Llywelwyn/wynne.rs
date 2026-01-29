/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly VERCEL_DEPLOY_HOOK: string;
  readonly ADMIN_GITHUB_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
