export type FeedbackCategory = 'REQUEST' | 'SUGGESTION' | 'COMPLAINT';
export type FeedbackStatus = 'NEW' | 'IN_REVIEW' | 'RESOLVED' | 'CLOSED';

export interface ContactInfo {
  id: string;
  title?: string | null;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  mapUrl?: string | null;
  phonePrimary?: string | null;
  phoneSecondary?: string | null;
  email?: string | null;
  workingHours?: string | null;
  socialLinks?: Record<string, string> | null;
  isActive: boolean;
  updatedAt: string;
}

export interface ContactInfoResponse {
  success: boolean;
  data: ContactInfo[];
  count: number;
}

export interface FeedbackPayload {
  category: FeedbackCategory;
  firstName: string;
  lastName: string;
  nationalId?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  message: string;
  kvkkAccepted: boolean;
  captchaToken: string;
}
