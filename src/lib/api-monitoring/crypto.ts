import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';
import 'server-only';

function getOptionalKeyMaterial() {
  const secret = process.env.MONITORED_API_CREDENTIALS_SECRET || process.env.PROVIDER_CREDENTIALS_SECRET;
  if (!secret) return null;
  return createHash('sha256').update(secret).digest();
}

export function encryptMonitorSecret(plaintext: string | null | undefined) {
  if (!plaintext) return null;

  const key = getOptionalKeyMaterial();
  if (!key) {
    return `raw:${plaintext}`;
  }

  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `enc:${iv.toString('base64')}.${tag.toString('base64')}.${encrypted.toString('base64')}`;
}

export function decryptMonitorSecret(ciphertext: string | null | undefined) {
  if (!ciphertext) return null;

  if (ciphertext.startsWith('raw:')) {
    return ciphertext.slice(4);
  }

  if (!ciphertext.startsWith('enc:')) {
    return ciphertext;
  }

  const key = getOptionalKeyMaterial();
  if (!key) {
    throw new Error('Missing MONITORED_API_CREDENTIALS_SECRET for encrypted monitor credentials.');
  }

  const [ivB64, tagB64, encryptedB64] = ciphertext.slice(4).split('.');
  if (!ivB64 || !tagB64 || !encryptedB64) {
    throw new Error('Stored monitor credential is not readable.');
  }

  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(ivB64, 'base64'));
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedB64, 'base64')),
    decipher.final(),
  ]).toString('utf8');
}
