// API servislerinin merkezi export dosyası
export { apiClient } from './apiClient';
export { bannerService, type Banner, type BannerGroup, type BannerStatistics } from './bannerService';
export { mediaService, type MediaFile, type MediaCategory } from './mediaService';
export { newsService, type NewsArticle, type NewsCategory } from './newsService';
export { projectService, type Project, type ProjectCategory } from './projectService';
export { departmentService, type Department, type GetDepartmentsParams } from './departmentService';

// API Response tiplerini de export edelim
export type { ApiResponse, PaginatedResponse } from './apiClient';
