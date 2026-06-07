import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/authStore';
import { AlertCircle } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      await login(data.email, data.password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8">
      {/* Logo/Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">AWASO SMS</h1>
        <p className="text-slate-600 dark:text-slate-400">School Management System</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
          <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0" size={20} />
          <p className="text-red-800 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Email Address
          </label>
          <input
            type="email"
            {...register('email')}
            className="input-base"
            placeholder="admin@awaso.edu.gh"
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Password
          </label>
          <input
            type="password"
            {...register('password')}
            className="input-base"
            placeholder="••••••••"
            disabled={isLoading}
          />
          {errors.password && (
            <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed mt-6"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      {/* Demo Credentials */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-2">Demo Credentials:</p>
        <p className="text-xs text-blue-800 dark:text-blue-400">Email: admin@awaso.edu.gh</p>
        <p className="text-xs text-blue-800 dark:text-blue-400">Password: admin123</p>
      </div>
    </div>
  );
};

export default LoginPage;
