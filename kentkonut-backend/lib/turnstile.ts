import { NextRequest } from 'next/server';

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export interface TurnstileVerifyResult {
  success: boolean;
  'error-codes'?: string[];
  action?: string;
  cdata?: string;
}

export async function verifyTurnstile(token: string, req: NextRequest): Promise<TurnstileVerifyResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    // If not configured, fail closed for security
    return { success: false, 'error-codes': ['missing-secret'] };
  }

  const ip = req.headers.get('cf-connecting-ip')
    || req.headers.get('x-forwarded-for')
    || req.ip
    || undefined as any;

  const form = new URLSearchParams();
  form.append('secret', secret);
  form.append('response', token);
  if (ip) form.append('remoteip', Array.isArray(ip) ? ip[0] : (ip as string));

  const res = await fetch(VERIFY_URL, {
    method: 'POST',
    body: form,
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
  });

  if (!res.ok) {
    return { success: false, 'error-codes': ['verify-request-failed'] };
  }

  const data = (await res.json()) as TurnstileVerifyResult;
  return data;
}
