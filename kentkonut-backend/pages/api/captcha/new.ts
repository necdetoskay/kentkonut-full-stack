import type { NextApiRequest, NextApiResponse } from 'next';
import svgCaptcha from 'svg-captcha';
import { randomUUID } from 'crypto';
import { redis } from '@/lib/redis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }
  try {
    const captcha = svgCaptcha.create({ size: 6, noise: 3, color: false, background: '#ffffff00' });
    const id = randomUUID();
    const key = `captcha:${id}`;
    await redis.set(key, captcha.text.toLowerCase(), { EX: 120 });
    return res.status(200).json({ success: true, id, svg: captcha.data });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: 'Captcha generation failed' });
  }
}
