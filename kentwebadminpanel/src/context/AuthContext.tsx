import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  login: (token: string, userData: any) => void;
  logout: () => void;
  register: (userData: any) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Local storage'dan token ve user bilgisini kontrol et
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (token: string, userData: any) => {
    try {
      setIsLoading(true);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setIsAuthenticated(true);
      setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Giriş işlemi başarısız oldu');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    try {
      setIsLoading(true);
      // API çağrısı burada yapılacak
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Kayıt işlemi başarısız oldu');
      }

      const data = await response.json();
      login(data.token, data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kayıt işlemi başarısız oldu');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated, 
        user, 
        login, 
        logout,
        register,
        isLoading,
        error,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 