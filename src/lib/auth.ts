/**
 * Legacy auth helpers — kept for reference only.
 * The project now uses Supabase Auth via @supabase/ssr.
 * Use src/lib/supabase/server.ts for server-side auth.
 * Use src/lib/supabase/client.ts for client-side auth.
 */

/** @deprecated Use `createClient` from `@/lib/supabase/server` instead. */
export const AUTH_COOKIE_NAME = 'sb-vxnsofjylclzrhbhczpo-auth-token';

export interface AuthSession {
  email: string;
  name: string;
}

/** @deprecated Sessions are now managed by Supabase SSR. */
export function readSessionToken(): null {
  return null;
}

/** @deprecated No longer used — OAuth providers handle credentials. */
export function getLoginExperience() {
  return { isDemoMode: false } as const;
}
