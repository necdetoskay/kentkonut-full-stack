// Menu API service - Backend ile iletişim için
import { apiClient } from './apiClient';
import { MenuItem, MenuApiResponse } from '../types/menu';

class MenuService {
  // Ana menü öğelerini getir (public endpoint)
  async getMainMenuItems(bustCache: boolean = false): Promise<MenuItem[]> {
    try {
      console.log('🔍 Fetching main menu items...');

      return this.getMenuItemsByLocation('main', true, bustCache);
    } catch (error) {
      console.error('❌ Error fetching main menu items:', error);
      throw error;
    }
  }

  // Menü cache'ini temizle ve yeniden yükle
  async refreshMainMenuItems(): Promise<MenuItem[]> {
    console.log('🔄 Refreshing main menu items (cache-busting)...');
    return this.getMainMenuItems(true);
  }

  // Belirli lokasyon için menü öğelerini getir
  async getMenuItemsByLocation(location: string = 'main', includeChildren: boolean = true, bustCache: boolean = false): Promise<MenuItem[]> {
    try {
      console.log(`🔍 Fetching menu items for location: ${location}`);

      const queryParams = new URLSearchParams();
      queryParams.append('location', location);
      if (includeChildren) {
        queryParams.append('includeChildren', 'true');
      }

      // Add cache-busting parameter if requested
      if (bustCache) {
        queryParams.append('_t', Date.now().toString());
      }

      const response = await apiClient.get<MenuApiResponse>(`/api/menu-items?${queryParams.toString()}`);
      
      if (response.success && response.data) {
        console.log(`✅ Menu items loaded for ${location}:`, response.data.data.length);
        return response.data.data;
      } else {
        console.error(`❌ Failed to load menu items for ${location}:`, response.error);
        return [];
      }
    } catch (error) {
      console.error(`❌ Error fetching menu items for ${location}:`, error);
      throw error;
    }
  }

  // Footer menü öğelerini getir
  async getFooterMenuItems(): Promise<MenuItem[]> {
    return this.getMenuItemsByLocation('footer', true);
  }

  // Sidebar menü öğelerini getir
  async getSidebarMenuItems(): Promise<MenuItem[]> {
    return this.getMenuItemsByLocation('sidebar', true);
  }

  // Menü öğesini URL'ye dönüştür
  getMenuItemUrl(item: MenuItem): string {
    // Eğer external link ise direkt URL'i döndür
    if (item.isExternal && item.url) {
      return item.url;
    }

    // Eğer URL varsa onu kullan
    if (item.url) {
      // URL / ile başlamıyorsa ekle
      return item.url.startsWith('/') ? item.url : `/${item.url}`;
    }

    // Eğer slug varsa onu kullan
    if (item.slug) {
      return `/${item.slug}`;
    }

    // Son çare olarak title'dan slug oluştur
    const slug = item.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    return `/${slug}`;
  }

  // Menü öğesinin target attribute'unu al
  getMenuItemTarget(item: MenuItem): string {
    return item.isExternal ? '_blank' : item.target || '_self';
  }

  // Aktif menü öğelerini filtrele
  filterActiveMenuItems(items: MenuItem[]): MenuItem[] {
    return items
      .filter(item => item.isActive)
      .map(item => ({
        ...item,
        children: item.children ? this.filterActiveMenuItems(item.children) : []
      }))
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }

  // Menü hiyerarşisini düzleştir (breadcrumb için)
  flattenMenuItems(items: MenuItem[]): MenuItem[] {
    const flattened: MenuItem[] = [];
    
    const flatten = (menuItems: MenuItem[]) => {
      menuItems.forEach(item => {
        flattened.push(item);
        if (item.children && item.children.length > 0) {
          flatten(item.children);
        }
      });
    };
    
    flatten(items);
    return flattened;
  }

  // Menü öğesini ID ile bul
  findMenuItemById(items: MenuItem[], id: string): MenuItem | null {
    for (const item of items) {
      if (item.id === id) {
        return item;
      }
      if (item.children && item.children.length > 0) {
        const found = this.findMenuItemById(item.children, id);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  // Menü öğesini URL ile bul
  findMenuItemByUrl(items: MenuItem[], url: string): MenuItem | null {
    for (const item of items) {
      const itemUrl = this.getMenuItemUrl(item);
      if (itemUrl === url) {
        return item;
      }
      if (item.children && item.children.length > 0) {
        const found = this.findMenuItemByUrl(item.children, url);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }
}

// Singleton instance
export const menuService = new MenuService();
export default menuService;
