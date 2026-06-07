import React, { useState } from 'react';
import { Menu, X, LogOut, Home, Users, BookOpen, Calendar, DollarSign, FileText } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: Home, label: 'Dashboard', href: '/' },
    { icon: Users, label: 'Students', href: '/students' },
    { icon: BookOpen, label: 'Teachers', href: '/teachers' },
    { icon: Calendar, label: 'Classes', href: '/classes' },
    { icon: FileText, label: 'Subjects', href: '/subjects' },
    { icon: Calendar, label: 'Attendance', href: '/attendance' },
    { icon: BookOpen, label: 'Exams', href: '/exams' },
    { icon: FileText, label: 'Grades', href: '/grades' },
    { icon: DollarSign, label: 'Fees', href: '/fees' },
    { icon: FileText, label: 'Report Cards', href: '/report-cards' }
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 flex items-center justify-between">
          <h1 className={`font-bold text-lg ${!sidebarOpen && 'hidden'}`}>AWASO SMS</h1>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-slate-800 rounded">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 transition-colors"
            >
              <item.icon size={20} />
              {sidebarOpen && <span>{item.label}</span>}
            </a>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-slate-700 p-4">
          {sidebarOpen && (
            <div className="mb-4">
              <p className="text-sm font-semibold">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-slate-400">{user?.role}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
          >
            <LogOut size={18} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 shadow-sm px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white">AWASO School Management System</h2>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Welcome, {user?.firstName}!
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
