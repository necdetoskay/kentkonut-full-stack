"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export interface MediaCategory {
  id: number;
  name: string;
  icon: string;
  order: number;
  isBuiltIn: boolean;
  mediaCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface MediaCategoryContextType {
  categories: MediaCategory[];
  isLoading: boolean;
  error: string | null;
  addCategory: (category: Omit<MediaCategory, "id" | "createdAt" | "updatedAt">) => Promise<MediaCategory>;
  updateCategory: (id: number, category: Partial<Omit<MediaCategory, "id" | "createdAt" | "updatedAt">>) => Promise<MediaCategory>;
  deleteCategory: (id: number) => Promise<void>;
  refreshCategories: () => Promise<void>;
}

const MediaCategoryContext = createContext<MediaCategoryContextType | undefined>(undefined);

export function MediaCategoryProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [categories, setCategories] = useState<MediaCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories on mount
  useEffect(() => {
    // Session yüklenene kadar bekle
    if (status === "loading") {
      return;
    }
    
    if (status === "authenticated" && session) {
      fetchCategories();
    } else if (status === "unauthenticated") {
      setIsLoading(false);
    }
  }, [session, status]);

  // Fetch all categories
  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get("/api/media-categories");
      setCategories(response.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Kategoriler yüklenirken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new category
  const addCategory = async (category: Omit<MediaCategory, "id" | "createdAt" | "updatedAt">) => {
    if (!session) {
      throw new Error("Bu işlem için giriş yapmanız gerekiyor.");
    }

    try {
      const response = await axios.post("/api/media-categories", category);
      const newCategory = response.data;
      setCategories((prev) => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      console.error("Error adding category:", err);
      throw err;
    }
  };

  // Update a category
  const updateCategory = async (id: number, category: Partial<Omit<MediaCategory, "id" | "createdAt" | "updatedAt">>) => {
    if (!session) {
      throw new Error("Bu işlem için giriş yapmanız gerekiyor.");
    }

    try {
      const response = await axios.put(`/api/media-categories/${id}`, category);
      const updatedCategory = response.data;
      setCategories((prev) =>
        prev.map((cat) => (cat.id === id ? updatedCategory : cat))
      );
      return updatedCategory;
    } catch (err) {
      console.error("Error updating category:", err);
      throw err;
    }
  };

  // Delete a category
  const deleteCategory = async (id: number) => {
    if (!session) {
      throw new Error("Bu işlem için giriş yapmanız gerekiyor.");
    }

    // Find the category to check if it's built-in
    const categoryToDelete = categories.find(cat => cat.id === id);

    if (categoryToDelete?.isBuiltIn) {
      throw new Error("Sistem kategorileri silinemez.");
    }

    try {
      await axios.delete(`/api/media-categories/${id}`);
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
    } catch (err: any) {
      console.error("Error deleting category:", err);
      // If the server returns a specific error message, use it
      if (err.response?.data?.error) {
        throw new Error(err.response.data.error);
      }
      throw err;
    }
  };

  // Refresh categories
  const refreshCategories = async () => {
    await fetchCategories();
  };

  return (
    <MediaCategoryContext.Provider
      value={{
        categories,
        isLoading,
        error,
        addCategory,
        updateCategory,
        deleteCategory,
        refreshCategories,
      }}
    >
      {children}
    </MediaCategoryContext.Provider>
  );
}

// Context hook
export function useMediaCategories() {
  const context = useContext(MediaCategoryContext);
  if (context === undefined) {
    throw new Error("useMediaCategories must be used within a MediaCategoryProvider");
  }
  return context;
}
