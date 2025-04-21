import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../ui/Input';
import Button from '../ui/Button';

// Form doğrulama şeması
const registerSchema = z.object({
  first_name: z.string().min(2, 'Ad en az 2 karakter olmalıdır'),
  last_name: z.string().min(2, 'Soyad en az 2 karakter olmalıdır'),
  email: z.string().email('Geçerli bir e-posta giriniz'),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalıdır'),
  password_confirm: z.string().min(8, 'Şifre onayı en az 8 karakter olmalıdır'),
}).refine((data) => data.password === data.password_confirm, {
  message: "Şifreler eşleşmiyor",
  path: ["password_confirm"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const RegisterForm: React.FC = () => {
  const { register: registerUser, isLoading, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      password_confirm: '',
    },
  });

  // Kimlik doğrulama durumu değiştiğinde dashboard'a yönlendir
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  const onSubmit = async (data: RegisterFormValues) => {
    await registerUser(data);
  };
  
  return (
    <div className="bg-slate-900 p-8 rounded-xl shadow-2xl w-full max-w-md border border-slate-800">
      <h2 className="text-3xl font-bold text-center text-white mb-8">Admin Hesabı Oluştur</h2>
      
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
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Ad"
            type="text"
            id="first_name"
            placeholder="Adınız"
            error={errors.first_name?.message}
            className="bg-slate-800 text-white border-slate-700 focus:border-blue-500 placeholder-slate-400"
            labelClassName="text-slate-200"
            {...register('first_name')}
          />
          
          <Input
            label="Soyad"
            type="text"
            id="last_name"
            placeholder="Soyadınız"
            error={errors.last_name?.message}
            className="bg-slate-800 text-white border-slate-700 focus:border-blue-500 placeholder-slate-400"
            labelClassName="text-slate-200"
            {...register('last_name')}
          />
        </div>
        
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
        
        <Input
          label="Şifre Onayı"
          type="password"
          id="password_confirm"
          placeholder="********"
          error={errors.password_confirm?.message}
          className="bg-slate-800 text-white border-slate-700 focus:border-blue-500 placeholder-slate-400"
          labelClassName="text-slate-200"
          {...register('password_confirm')}
        />
        
        <div className="mt-2">
          <p className="text-sm text-slate-400">
            Kayıt olarak, <Link to="/terms" className="text-blue-400 hover:text-blue-300">Kullanım Şartları</Link> ve{' '}
            <Link to="/privacy" className="text-blue-400 hover:text-blue-300">Gizlilik Politikası</Link>'nı kabul etmiş olursunuz.
          </p>
        </div>
        
        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isLoading}
          className="bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg transition-colors mt-6"
        >
          Kayıt Ol
        </Button>
      </form>
      
      <div className="mt-8 text-center">
        <p className="text-slate-300">
          Zaten bir hesabınız var mı?{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
            Giriş Yap
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm; 