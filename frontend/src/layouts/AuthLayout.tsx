import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
};

export default AuthLayout;
