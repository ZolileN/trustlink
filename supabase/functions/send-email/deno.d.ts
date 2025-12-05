/// <reference no-default-lib="true" />
/// <reference lib="esnext" />

// Minimal Deno types for Supabase Edge Functions
declare namespace Deno {
  export const env: {
    get(key: string): string | undefined;
  };
  export function readTextFileSync(path: string | URL): string;
  export function readTextFile(path: string | URL): Promise<string>;
}