import { createHash, randomBytes } from 'crypto';
import type { WorkspaceKeyEnvironment } from '@/lib/apiverse-keys/types';

export function generateWorkspaceApiKey(environment: WorkspaceKeyEnvironment) {
  const envPrefix = environment === 'live' ? 'live' : 'test';
  const token = randomBytes(24).toString('base64url');
  return `apv_${envPrefix}_${token}`;
}

export function hashWorkspaceApiKey(plainKey: string) {
  return createHash('sha256').update(plainKey).digest('hex');
}

export function buildWorkspaceKeyFragments(plainKey: string) {
  const lastFour = plainKey.slice(-4);
  const keyPrefix = plainKey.slice(0, Math.min(14, plainKey.length));

  return {
    keyPrefix,
    lastFour,
  };
}
