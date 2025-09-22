export interface ServiceCard {
  id: number;
  title: string;
  description?: string;
  shortDescription?: string;
  slug: string;
  imageUrl: string;
  altText?: string;
  targetUrl?: string;
  isExternal: boolean;
  color: string;
  backgroundColor?: string;
  textColor?: string;
  isFeatured: boolean;
  displayOrder: number;
  viewCount: number;
  clickCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceCardsApiResponse {
  success: boolean;
  data: ServiceCard[];
  count: number;
  error?: string;
}

export interface ClickTrackingResponse {
  success: boolean;
  message: string;
  error?: string;
}
