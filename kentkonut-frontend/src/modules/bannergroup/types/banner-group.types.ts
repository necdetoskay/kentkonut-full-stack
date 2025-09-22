export interface BannerGroup {
  id: number;
  name: string;
  description: string | null;
  type: string;
  active: boolean;
  deletable: boolean;
  playMode: 'AUTO' | 'MANUAL';
  duration: number;
  transitionDuration: number;
  animation: string;
  width: number;
  height: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBannerGroupDto {
  name: string;
  description?: string;
  type?: string;
  active?: boolean;
  playMode?: 'AUTO' | 'MANUAL';
  duration?: number;
  transitionDuration?: number;
  animation?: string;
  width?: number;
  height?: number;
}

export interface UpdateBannerGroupDto extends Partial<CreateBannerGroupDto> {
  id: number;
}
