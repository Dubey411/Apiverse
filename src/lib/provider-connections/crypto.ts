import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';
import 'server-only';

function getKeyMaterial() {
  const secret = process.env.PROVIDER_CREDENTIALS_SECRET;

  if (!secret) {
    throw new Error('Missing PROVIDER_CREDENTIALS_SECRET. Add it to your environment before connecting provider keys.');
  }

  return createHash('sha256').update(secret).digest();
}

export function encryptCredentials(payload: Record<string, string>) {
  const iv = randomBytes(12);
  const key = getKeyMaterial();
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const plaintext = JSON.stringify(payload);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${iv.toString('base64')}.${tag.toString('base64')}.${encrypted.toString('base64')}`;
}

export function decryptCredentials(ciphertext: string): Record<string, string> {
  const [ivB64, tagB64, encryptedB64] = ciphertext.split('.');

  if (!ivB64 || !tagB64 || !encryptedB64) {
    throw new Error('Stored provider credentials are not in a readable format.');
  }

  const key = getKeyMaterial();
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(ivB64, 'base64'));
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedB64, 'base64')),
    decipher.final(),
  ]).toString('utf8');

  return JSON.parse(decrypted) as Record<string, string>;
}
