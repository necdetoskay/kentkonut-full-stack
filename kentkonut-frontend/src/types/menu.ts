// Menu types for kentkonut frontend
export interface MenuItem {
  id: string;
  title: string;
  slug?: string;
  url?: string;
  icon?: string;
  description?: string;
  isActive: boolean;
  isExternal: boolean;
  target: string;
  cssClass?: string;
  orderIndex: number;
  menuLocation: string;
  parentId?: string;
  parent?: {
    id: string;
    title: string;
  };
  children?: MenuItem[];
  createdAt: string;
  updatedAt: string;
}

export interface MenuApiResponse {
  success: boolean;
  data: MenuItem[];
  count: number;
}

// Legacy menu item interface for backward compatibility
export interface LegacyMenuItem {
  href: string;
  label: string;
}

// Menu state for React components
export interface MenuState {
  items: MenuItem[];
  loading: boolean;
  error: string | null;
}

// Menu location types
export type MenuLocation = 'main' | 'footer' | 'sidebar';

// Menu target types
export type MenuTarget = '_self' | '_blank' | '_parent' | '_top';
