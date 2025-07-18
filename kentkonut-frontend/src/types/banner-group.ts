export interface BannerGroup {
  id: number;
  name: string;
  description?: string;
  type: string;
  active: boolean;
  deletable: boolean;
  playMode: string;
  duration: number;
  transitionDuration: number;
  animation: string;
  width: number;
  height: number;
  createdAt: string;
  updatedAt: string;
}
