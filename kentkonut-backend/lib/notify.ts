export interface FeedbackEmailPayload {
  id: string;
  category: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  message: string;
  createdAt?: string;
}

// Mock SMTP notifier. In production, replace with nodemailer implementation.
export async function sendFeedbackEmail(payload: FeedbackEmailPayload): Promise<void> {
  const mock = process.env.NOTIFY_MOCK ?? 'true';
  const to = process.env.FEEDBACK_MAIL_TO ?? 'feedback@example.com';

  if (mock === 'true') {
    console.log('[MOCK EMAIL] New feedback notification', { to, payload });
    return;
  }

  // Real SMTP (placeholder):
  // const transporter = nodemailer.createTransport({ ...env });
  // await transporter.sendMail({ from, to, subject, text/html });
  console.warn('[notify] Real SMTP not configured. Set NOTIFY_MOCK=false and provide SMTP_* envs.');
}
