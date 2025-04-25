"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";

// Kullanıcı tipi tanımı
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Yeni kullanıcı oluşturma için tip
interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: string;
  status: string;
}

// Kullanıcı güncelleme için tip
interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  status?: string;
}

// Context veri tipi
interface UserContextType {
  users: User[];
  isLoading: boolean;
  error: string | null;
  addUser: (user: CreateUserData) => Promise<void>;
  updateUser: (id: number, user: UpdateUserData) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
}

// Context'i oluşturalım
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider Component
export function UserProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Kullanıcıları yükle
  useEffect(() => {
    const fetchUsers = async () => {
      // Sadece oturum açmış kullanıcılar için yükle
      if (status === "authenticated" && session) {
        try {
          const response = await axios.get("/api/users");
          setUsers(response.data);
        } catch (err) {
          setError("Kullanıcılar yüklenirken bir hata oluştu.");
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [session, status]);

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
  const updateUser = async (id: number, userData: UpdateUserData) => {
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
  const deleteUser = async (id: number) => {
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