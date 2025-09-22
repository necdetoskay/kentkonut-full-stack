
export interface FooterItem {
  id: string;
  order: number;
  type: 'LINK' | 'EMAIL' | 'PHONE' | 'ADDRESS' | 'IMAGE' | 'TEXT';
  label: string | null;
  url: string | null;
  target: string | null;
  isExternal: boolean;
  icon: string | null;
  imageUrl: string | null;
  text: string | null;
  metadata: any | null;
}

export interface FooterSection {
  id: string;
  key: string;
  title: string | null;
  type: 'LINKS' | 'IMAGE' | 'CONTACT' | 'TEXT' | 'LEGAL';
  orientation: 'VERTICAL' | 'HORIZONTAL';
  order: number;
  isActive: boolean;
  layoutConfig: any | null;
  items: FooterItem[];
}
