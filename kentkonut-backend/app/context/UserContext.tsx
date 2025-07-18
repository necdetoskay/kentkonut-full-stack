"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

// Kullanıcı tipi tanımı
export interface User {
  id: string; // UUID olarak string tipinde
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  image?: string | null;
  emailVerified?: Date | null;
}

// Yeni kullanıcı oluşturma için tip
interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: string;
}

// Kullanıcı güncelleme için tip
interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  emailVerified?: boolean;
}

// Context veri tipi
interface UserContextType {
  users: User[];
  isLoading: boolean;
  error: string | null;
  addUser: (user: CreateUserData) => Promise<void>;
  updateUser: (id: string, user: UpdateUserData) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

// Context'i oluşturalım
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider Component
export function UserProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Kullanıcıları yükle
  useEffect(() => {
    const fetchUsers = async () => {
      // Sadece dashboard sayfalarında kullanıcıları yükle
      if (!pathname.startsWith('/dashboard')) {
        setIsLoading(false);
        return;
      }

      // Session yüklenene kadar bekle
      if (status === "loading") {
        return;
      }
      
      // Sadece oturum açmış kullanıcılar için yükle
      if (status === "authenticated" && session) {
        try {
          console.log("Kullanıcılar yükleniyor...");
          const response = await axios.get("/api/users");
          console.log("API yanıtı:", response.data);

          if (Array.isArray(response.data)) {
            setUsers(response.data);
            console.log("Kullanıcılar başarıyla yüklendi:", response.data.length);
          } else {
            console.error("API yanıtı bir dizi değil:", response.data);
            setError("Kullanıcı verileri beklenmeyen formatta.");
          }
        } catch (err: any) {
          console.error("Kullanıcı yükleme hatası:", err);

          // Handle different types of errors
          if (err.response?.status === 401) {
            setError("Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.");
            // Optionally trigger logout or redirect
          } else if (err.response?.status === 403) {
            setError("Bu işlem için yetkiniz bulunmuyor.");
          } else if (err.response?.status >= 500) {
            setError("Sunucu hatası. Lütfen daha sonra tekrar deneyin.");
          } else {
            setError("Kullanıcılar yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.");
          }
        } finally {
          setIsLoading(false);
        }
      } else if (status === "unauthenticated") {
        // Oturum açmamış durumda loading'i false yap
        console.log("Oturum durumu:", status, "Session:", !!session);
        setIsLoading(false);
      }
    };    fetchUsers();
  }, [session, status, pathname]);

  // Kullanıcı ekle
  const addUser = async (userData: CreateUserData) => {
    if (!session) {
      throw new Error("Bu işlem için giriş yapmanız gerekiyor.");
    }

    setIsLoading(true);
    try {
      const response = await axios.post("/api/users", userData);
      setUsers((prev) => [...prev, response.data]);
    } catch (err) {
      setError("Kullanıcı eklenirken bir hata oluştu.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Kullanıcı güncelle
  const updateUser = async (id: string, userData: UpdateUserData) => {
    if (!session) {
      throw new Error("Bu işlem için giriş yapmanız gerekiyor.");
    }

    setIsLoading(true);
    try {
      const response = await axios.patch(`/api/users/${id}`, userData);
      setUsers((prev) =>
        prev.map((user) => (user.id === id ? response.data : user))
      );
    } catch (err) {
      setError("Kullanıcı güncellenirken bir hata oluştu.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Kullanıcı sil
  const deleteUser = async (id: string) => {
    if (!session) {
      throw new Error("Bu işlem için giriş yapmanız gerekiyor.");
    }

    setIsLoading(true);
    try {
      await axios.delete(`/api/users/${id}`);
      setUsers((prev) => prev.filter((user) => user.id !== id));
    } catch (err) {
      setError("Kullanıcı silinirken bir hata oluştu.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UserContext.Provider
      value={{ users, isLoading, error, addUser, updateUser, deleteUser }}
    >
      {children}
    </UserContext.Provider>
  );
}

// Context hook
export function useUsers() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUsers must be used within a UserProvider");
  }
  return context;
}