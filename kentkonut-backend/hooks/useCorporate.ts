// Corporate Data Management Hooks
// Centralized hooks for managing corporate module state and API calls

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { CorporateAPI, handleApiError, invalidateCache } from '@/utils/corporateApi';
import { 
  Executive, 
  QuickLink, 
  Department, 
  ExecutiveStats, 
  QuickLinkStats,
  DepartmentStats,
  ExecutiveFilters,
  QuickLinkFilters,
  DepartmentFilters 
} from '@/types/corporate';

// Generic hook for data fetching with loading and error states
export function useApiData<T>(
  fetcher: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await fetcher();
      setData(result);
    } catch (err) {
      const { message } = handleApiError(err);
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

// Executives Management Hook
export function useExecutives(filters?: ExecutiveFilters) {
  const [executives, setExecutives] = useState<Executive[]>([]);
  const [filteredExecutives, setFilteredExecutives] = useState<Executive[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch executives
  const fetchExecutives = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await CorporateAPI.executives.getAll({
        type: filters?.type
      });

      setExecutives(data);
    } catch (err) {
      const { message } = handleApiError(err);
      setError(message);
      toast.error('Yöneticiler yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  }, [filters?.type]);

  // Apply client-side filters
  useEffect(() => {
    let filtered = executives;

    if (filters?.isActive !== undefined) {
      filtered = filtered.filter(exec => exec.isActive === filters.isActive);
    }

    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(exec =>
        exec.name.toLowerCase().includes(searchTerm) ||
        exec.title.toLowerCase().includes(searchTerm) ||
        exec.position.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredExecutives(filtered);
  }, [executives, filters]);

  // Create executive
  const createExecutive = useCallback(async (data: any) => {
    try {
      await CorporateAPI.executives.create(data);
      toast.success('Yönetici başarıyla oluşturuldu');
      invalidateCache.executives();
      await fetchExecutives();
    } catch (err) {
      const { message } = handleApiError(err);
      toast.error(message);
      throw err;
    }
  }, [fetchExecutives]);

  // Update executive
  const updateExecutive = useCallback(async (id: string, data: any) => {
    try {
      await CorporateAPI.executives.update(id, data);
      toast.success('Yönetici başarıyla güncellendi');
      invalidateCache.executives();
      await fetchExecutives();
    } catch (err) {
      const { message } = handleApiError(err);
      toast.error(message);
      throw err;
    }
  }, [fetchExecutives]);

  // Delete executive
  const deleteExecutive = useCallback(async (id: string) => {
    try {
      await CorporateAPI.executives.delete(id);
      toast.success('Yönetici başarıyla silindi');
      invalidateCache.executives();
      await fetchExecutives();
    } catch (err) {
      const { message } = handleApiError(err);
      toast.error(message);
      throw err;
    }
  }, [fetchExecutives]);

  // Get statistics
  const getStatistics = useCallback((): ExecutiveStats => {
    return {
      total: executives.length,
      active: executives.filter(exec => exec.isActive).length,
      types: {
        president: executives.filter(exec => exec.type === 'PRESIDENT').length,
        generalManager: executives.filter(exec => exec.type === 'GENERAL_MANAGER').length,
        director: executives.filter(exec => exec.type === 'DIRECTOR').length,
        manager: executives.filter(exec => exec.type === 'MANAGER').length,
        department: executives.filter(exec => exec.type === 'DEPARTMENT').length,
        strategy: executives.filter(exec => exec.type === 'STRATEGY').length,
        goal: executives.filter(exec => exec.type === 'GOAL').length,
      },
    };
  }, [executives]);

  useEffect(() => {
    fetchExecutives();
  }, [fetchExecutives]);

  return {
    executives: filteredExecutives,
    allExecutives: executives,
    isLoading,
    error,
    statistics: getStatistics(),
    actions: {
      create: createExecutive,
      update: updateExecutive,
      delete: deleteExecutive,
      refetch: fetchExecutives,
    },
  };
}

// Quick Links Management Hook
export function useQuickLinks(filters?: QuickLinkFilters) {
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>([]);
  const [filteredQuickLinks, setFilteredQuickLinks] = useState<QuickLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch quick links
  const fetchQuickLinks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await CorporateAPI.quickLinks.getAll();
      setQuickLinks(data);
    } catch (err) {
      const { message } = handleApiError(err);
      setError(message);
      toast.error('Hızlı erişim linkleri yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Apply client-side filters
  useEffect(() => {
    let filtered = quickLinks;

    if (filters?.isActive !== undefined) {
      filtered = filtered.filter(link => link.isActive === filters.isActive);
    }

    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(link =>
        link.title.toLowerCase().includes(searchTerm) ||
        link.url.toLowerCase().includes(searchTerm) ||
        (link.description && link.description.toLowerCase().includes(searchTerm))
      );
    }

    setFilteredQuickLinks(filtered);
  }, [quickLinks, filters]);

  // Create quick link
  const createQuickLink = useCallback(async (data: any) => {
    try {
      await CorporateAPI.quickLinks.create(data);
      toast.success('Hızlı erişim linki başarıyla oluşturuldu');
      invalidateCache.quickLinks();
      await fetchQuickLinks();
    } catch (err) {
      const { message } = handleApiError(err);
      toast.error(message);
      throw err;
    }
  }, [fetchQuickLinks]);

  // Update quick link
  const updateQuickLink = useCallback(async (id: string, data: any) => {
    try {
      await CorporateAPI.quickLinks.update(id, data);
      toast.success('Hızlı erişim linki başarıyla güncellendi');
      invalidateCache.quickLinks();
      await fetchQuickLinks();
    } catch (err) {
      const { message } = handleApiError(err);
      toast.error(message);
      throw err;
    }
  }, [fetchQuickLinks]);

  // Delete quick link
  const deleteQuickLink = useCallback(async (id: string) => {
    try {
      await CorporateAPI.quickLinks.delete(id);
      toast.success('Hızlı erişim linki başarıyla silindi');
      invalidateCache.quickLinks();
      await fetchQuickLinks();
    } catch (err) {
      const { message } = handleApiError(err);
      toast.error(message);
      throw err;
    }
  }, [fetchQuickLinks]);

  // Get statistics
  const getStatistics = useCallback((): QuickLinkStats => {
    return {
      total: quickLinks.length,
      active: quickLinks.filter(link => link.isActive).length,
      inactive: quickLinks.filter(link => !link.isActive).length,
    };
  }, [quickLinks]);

  useEffect(() => {
    fetchQuickLinks();
  }, [fetchQuickLinks]);

  return {
    quickLinks: filteredQuickLinks,
    allQuickLinks: quickLinks,
    isLoading,
    error,
    statistics: getStatistics(),
    actions: {
      create: createQuickLink,
      update: updateQuickLink,
      delete: deleteQuickLink,
      refetch: fetchQuickLinks,
    },
  };
}

// Single Executive Hook
export function useExecutive(id: string | null) {
  const [executive, setExecutive] = useState<Executive | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExecutive = useCallback(async () => {
    if (!id) {
      setExecutive(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const data = await CorporateAPI.executives.getById(id);
      setExecutive(data);
    } catch (err) {
      const { message } = handleApiError(err);
      setError(message);
      toast.error('Yönetici bilgileri yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchExecutive();
  }, [fetchExecutive]);

  return { executive, isLoading, error, refetch: fetchExecutive };
}

// Single Quick Link Hook
export function useQuickLink(id: string | null) {
  const [quickLink, setQuickLink] = useState<QuickLink | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuickLink = useCallback(async () => {
    if (!id) {
      setQuickLink(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const data = await CorporateAPI.quickLinks.getById(id);
      setQuickLink(data);
    } catch (err) {
      const { message } = handleApiError(err);
      setError(message);
      toast.error('Hızlı erişim linki bilgileri yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchQuickLink();
  }, [fetchQuickLink]);

  return { quickLink, isLoading, error, refetch: fetchQuickLink };
}

// Departments Management Hook
export function useDepartments(filters?: DepartmentFilters) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all departments
  const fetchDepartments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await CorporateAPI.departments.getAll();
      setDepartments(data);
    } catch (err) {
      const { message } = handleApiError(err);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...departments];

    if (filters?.isActive !== undefined) {
      filtered = filtered.filter(dept => dept.isActive === filters.isActive);
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(dept => 
        dept.name.toLowerCase().includes(searchLower) ||
        dept.description?.toLowerCase().includes(searchLower) ||
        dept.manager?.toLowerCase().includes(searchLower)
      );
    }

    if (filters?.hasManager !== undefined) {
      if (filters.hasManager) {
        filtered = filtered.filter(dept => dept.manager && dept.manager.trim() !== '');
      } else {
        filtered = filtered.filter(dept => !dept.manager || dept.manager.trim() === '');
      }
    }

    setFilteredDepartments(filtered);
  }, [departments, filters]);

  // Create department
  const createDepartment = useCallback(async (data: any) => {
    try {
      await CorporateAPI.departments.create(data);
      toast.success('Birim başarıyla oluşturuldu');
      invalidateCache.departments();
      await fetchDepartments();
    } catch (err) {
      const { message } = handleApiError(err);
      toast.error(message);
      throw err;
    }
  }, [fetchDepartments]);

  // Update department
  const updateDepartment = useCallback(async (id: string, data: any) => {
    try {
      await CorporateAPI.departments.update(id, data);
      toast.success('Birim başarıyla güncellendi');
      invalidateCache.departments();
      await fetchDepartments();
    } catch (err) {
      const { message } = handleApiError(err);
      toast.error(message);
      throw err;
    }
  }, [fetchDepartments]);

  // Delete department
  const deleteDepartment = useCallback(async (id: string) => {
    try {
      await CorporateAPI.departments.delete(id);
      toast.success('Birim başarıyla silindi');
      invalidateCache.departments();
      await fetchDepartments();
    } catch (err) {
      const { message } = handleApiError(err);
      toast.error(message);
      throw err;
    }
  }, [fetchDepartments]);

  // Get statistics
  const getStatistics = useCallback((): DepartmentStats => {
    const activeDepartments = departments.filter(dept => dept.isActive);
    const totalEmployees = departments.reduce((sum, dept) => {
      // Estimate employees based on services count (rough approximation)
      return sum + (dept.services?.length || 0) * 2; // Assume 2 employees per service
    }, 0);

    return {
      total: departments.length,
      active: activeDepartments.length,
      inactive: departments.length - activeDepartments.length,
      totalEmployees,
    };
  }, [departments]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  return {
    // Data
    departments: filteredDepartments,
    allDepartments: departments,
    
    // State
    isLoading,
    error,
    statistics: getStatistics(),
    
    // Actions
    actions: {
      create: createDepartment,
      update: updateDepartment,
      delete: deleteDepartment,
      refetch: fetchDepartments,
    },
  };
}

// Combined Corporate Statistics Hook
export function useCorporateStatistics() {
  const { statistics: executiveStats, isLoading: executivesLoading } = useExecutives();
  // const { statistics: quickLinkStats, isLoading: quickLinksLoading } = useQuickLinks(); // Temporarily disabled
  const { statistics: departmentStats, isLoading: departmentsLoading } = useDepartments();

  const isLoading = executivesLoading || departmentsLoading; // || quickLinksLoading;

  const statistics = {
    executives: executiveStats,
    // quickLinks: quickLinkStats, // Temporarily disabled
    departments: departmentStats,
  };

  return { statistics, isLoading };
}

// Form handling hook
export function useFormSubmission<T>(
  onSubmit: (data: T) => Promise<void>,
  onSuccess?: () => void
) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async (data: T) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
      onSuccess?.();
    } catch (error) {
      // Error handling is done in the onSubmit function
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, onSuccess]);

  return { isSubmitting, handleSubmit };
}
