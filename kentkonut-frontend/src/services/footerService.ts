
import { API_BASE_URL } from '../config/environment';
import { FooterSection } from '../types/footer';

export const getFooterSections = async (): Promise<FooterSection[]> => {
  const url = `${API_BASE_URL}/api/public/footer-sections`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      // credentials: 'include', // uncomment if backend requires cookies
    });
    if (!response.ok) {
      const status = response.status;
      const statusText = response.statusText;
      let bodyText = '';
      try { bodyText = await response.text(); } catch {}
      console.error(`[footerService] Non-OK response`, { url, status, statusText, bodyText });
      return [];
    }
    const data: FooterSection[] = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('[footerService] Failed to fetch footer sections', { url, error });
    return [];
  }
};
