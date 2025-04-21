import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../ui/Input';
import Button from '../ui/Button';

// Form doğrulama şeması
const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta giriniz'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginForm: React.FC = () => {
  const { login, isLoading, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  // Kimlik doğrulama durumu değiştiğinde dashboard'a yönlendir
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  const onSubmit = async (data: LoginFormValues) => {
    await login(data.email, data.password);
  };
  
  return (
    <div className="bg-slate-900 p-8 rounded-xl shadow-2xl w-full max-w-md border border-slate-800">
      <h2 className="text-3xl font-bold text-center text-white mb-8">Admin Paneli Girişi</h2>
      
      {error && (
        <div className="bg-red-900/50 text-red-200 p-4 rounded-lg mb-6 border border-red-800">
          {error}
          <button 
            onClick={clearError} 
            className="float-right text-red-200 hover:text-red-100"
          >
            ✕
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="E-posta"
          type="email"
          id="email"
          placeholder="ornek@example.com"
          error={errors.email?.message}
          className="bg-slate-800 text-white border-slate-700 focus:border-blue-500 placeholder-slate-400"
          labelClassName="text-slate-200"
          {...register('email')}
        />
        
        <Input
          label="Şifre"
          type="password"
          id="password"
          placeholder="********"
          error={errors.password?.message}
          className="bg-slate-800 text-white border-slate-700 focus:border-blue-500 placeholder-slate-400"
          labelClassName="text-slate-200"
          {...register('password')}
        />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-500 focus:ring-blue-500 bg-slate-800 border-slate-700 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-200">
              Beni hatırla
            </label>
          </div>
          
          <div className="text-sm">
            <Link to="/forgot-password" className="text-blue-400 hover:text-blue-300 font-medium">
              Şifrenizi mi unuttunuz?
            </Link>
          </div>
        </div>
        
        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isLoading}
          className="bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg transition-colors"
        >
          Giriş Yap
        </Button>
      </form>
      
      <div className="mt-8 text-center">
        <p className="text-slate-300">
          Hesabınız yok mu?{' '}
          <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium">
            Kayıt Ol
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm; 