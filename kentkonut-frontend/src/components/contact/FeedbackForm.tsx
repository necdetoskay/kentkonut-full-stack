import React, { useEffect, useRef, useState } from 'react';
import type { FeedbackCategory, FeedbackPayload } from '@/types/contact';

declare global {
  interface Window {
    turnstile?: any;
  }
}

const categories: { label: string; value: FeedbackCategory }[] = [
  { label: 'İstek', value: 'REQUEST' },
  { label: 'Öneri', value: 'SUGGESTION' },
  { label: 'Şikayet', value: 'COMPLAINT' },
];

const loadTurnstileScriptOnce = (() => {
  let loaded = false;
  return () => {
    if (loaded) return;
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    document.head.appendChild(script);
    loaded = true;
  };
})();

const FeedbackForm: React.FC = () => {
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;
  const [submitting, setSubmitting] = useState(false);
  const apiBase = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || '';
  const [captchaToken, setCaptchaToken] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // self-host captcha state
  const [captchaSvg, setCaptchaSvg] = useState<string>('');
  const [captchaId, setCaptchaId] = useState<string>('');
  const [captchaAnswer, setCaptchaAnswer] = useState<string>('');

  const [form, setForm] = useState({
    category: 'REQUEST' as FeedbackCategory,
    firstName: '',
    lastName: '',
    nationalId: '',
    email: '',
    phone: '',
    address: '',
    message: '',
    kvkkAccepted: false,
  });

  const captchaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!siteKey) return;
    loadTurnstileScriptOnce();

    const iv = setInterval(() => {
      if (window.turnstile && captchaRef.current) {
        try {
          window.turnstile.render(captchaRef.current, {
            sitekey: siteKey,
            callback: (token: string) => setCaptchaToken(token),
            'error-callback': () => setCaptchaToken(''),
            'expired-callback': () => setCaptchaToken(''),
            theme: 'auto',
          });
          clearInterval(iv);
        } catch {}
      }
    }, 300);

    return () => clearInterval(iv);
  }, [siteKey]);

  // self-host captcha loader
  const loadSelfCaptcha = async () => {
    try {
      const res = await fetch(`${apiBase}/api/captcha/new`, { method: 'POST' });
      const json = await res.json();
      if (json?.success) {
        setCaptchaId(json.id);
        setCaptchaSvg(json.svg);
        setCaptchaAnswer('');
      } else {
        setError('Captcha oluşturulamadı');
      }
    } catch {
      setError('Captcha servisine ulaşılamadı');
    }
  };

  useEffect(() => {
    if (!siteKey) {
      loadSelfCaptcha();
    }
  }, [siteKey]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as any;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const validate = (): string | null => {
    if (!form.firstName || !form.lastName) return 'Lütfen ad ve soyad giriniz.';
    if (!form.message || form.message.length < 10) return 'Mesaj en az 10 karakter olmalıdır.';
    if (!form.kvkkAccepted) return 'KVKK onayını kabul ediniz.';
    // Captcha check depends on mode
    if (siteKey) {
      if (!captchaToken) return 'Güvenlik doğrulaması gerekli.';
    } else {
      if (!captchaId || !captchaAnswer) return 'Güvenlik doğrulaması gerekli.';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setSubmitting(true);
    try {
      const payload: FeedbackPayload = {
        category: form.category,
        firstName: form.firstName,
        lastName: form.lastName,
        nationalId: form.nationalId || undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
        address: form.address || undefined,
        message: form.message,
        kvkkAccepted: form.kvkkAccepted,
        captchaToken: siteKey ? captchaToken : undefined,
        // @ts-ignore add optional fields when self-host is active
        captchaId: !siteKey ? captchaId : undefined,
        // @ts-ignore
        captchaAnswer: !siteKey ? captchaAnswer : undefined,
      };
      const res = await fetch(`${apiBase}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setMessage('Geri bildiriminiz için teşekkür ederiz.');
        setForm({
          category: 'REQUEST',
          firstName: '',
          lastName: '',
          nationalId: '',
          email: '',
          phone: '',
          address: '',
          message: '',
          kvkkAccepted: false,
        });
        setCaptchaToken('');
        if (!siteKey) {
          // refresh self captcha
          loadSelfCaptcha();
        }
        // Try to reset widget
        if (window.turnstile && captchaRef.current) {
          try { window.turnstile.reset(captchaRef.current); } catch {}
        }
      } else {
        setError(json?.error || 'Gönderim başarısız oldu.');
      }
    } catch (e) {
      setError('Sunucu hatası oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 rounded-lg border bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-4">İstek • Öneri • Şikayet</h2>

      {message && (
        <div className="mb-4 rounded border border-green-200 bg-green-50 text-green-700 px-4 py-3">{message}</div>
      )}
      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 text-red-700 px-4 py-3">{error}</div>
      )}

      {/* Self-host captcha aktifse bilgilendirme yerine SVG captcha göstereceğiz */}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="category">Seçiminiz</label>
          <select id="category" name="category" value={form.category} onChange={onChange} className="w-full border rounded px-3 py-2">
            {categories.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="firstName">Adınız</label>
            <input id="firstName" name="firstName" value={form.firstName} onChange={onChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="lastName">Soyadınız</label>
            <input id="lastName" name="lastName" value={form.lastName} onChange={onChange} className="w-full border rounded px-3 py-2" required />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="phone">Telefon</label>
            <input id="phone" name="phone" value={form.phone} onChange={onChange} className="w-full border rounded px-3 py-2" placeholder="0 262 ..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email">E-Posta</label>
            <input id="email" name="email" type="email" value={form.email} onChange={onChange} className="w-full border rounded px-3 py-2" placeholder="ornek@domain.com" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="address">Adres</label>
          <input id="address" name="address" value={form.address} onChange={onChange} className="w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="message">Mesaj</label>
          <textarea id="message" name="message" value={form.message} onChange={onChange} className="w-full border rounded px-3 py-2" rows={5} required />
        </div>

        <div className="flex items-center gap-2">
          <input id="kvkk" name="kvkkAccepted" type="checkbox" checked={form.kvkkAccepted} onChange={onChange} />
          <label htmlFor="kvkk" className="text-sm">KVKK ve gizlilik politikasını okudum, kabul ediyorum.</label>
        </div>

        {siteKey ? (
          <div>
            <div ref={captchaRef} className="cf-turnstile" />
            <p className="text-xs text-gray-500 mt-1">Güvenlik doğrulaması için kutuyu tamamlayın.</p>
          </div>
        ) : (
          <div>
            {captchaSvg ? (
              <div className="flex items-center gap-3">
                <div className="border rounded p-2 bg-gray-50" dangerouslySetInnerHTML={{ __html: captchaSvg }} />
                <button type="button" onClick={loadSelfCaptcha} className="text-sm px-2 py-1 border rounded">Yenile</button>
              </div>
            ) : (
              <div className="text-sm text-gray-600">Captcha yükleniyor…</div>
            )}
            <div className="mt-2">
              <label className="block text-sm font-medium mb-1">Güvenlik Kodu</label>
              <input value={captchaAnswer} onChange={(e) => setCaptchaAnswer(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Resimdeki kod" />
            </div>
          </div>
        )}

    <div className="pt-2">
      <button
        type="submit"
        disabled={submitting || (siteKey ? !captchaToken : (!captchaId || !captchaAnswer))}
        className="px-4 py-2 rounded bg-primary text-white disabled:opacity-50"
      >
        {submitting ? 'Gönderiliyor...' : 'Gönder'}
      </button>
    </div>
  </form>
</div>
);
}

export default FeedbackForm;
