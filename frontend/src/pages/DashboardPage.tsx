import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/api';

const DashboardPage: React.FC = () => {
  // Sample data for charts
  const chartData = [
    { name: 'Form 1', students: 40, teachers: 4 },
    { name: 'Form 2', students: 38, teachers: 4 },
    { name: 'Form 3', students: 42, teachers: 4 }
  ];

  const stats = [
    { label: 'Total Students', value: '120', color: 'bg-blue-500' },
    { label: 'Total Teachers', value: '24', color: 'bg-green-500' },
    { label: 'Total Classes', value: '3', color: 'bg-purple-500' },
    { label: 'Total Subjects', value: '15', color: 'bg-orange-500' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400">Welcome to AWASO School Management System</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} w-12 h-12 rounded-lg opacity-20`}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Students & Teachers by Class</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="students" fill="#10b981" />
              <Bar dataKey="teachers" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full btn-primary text-left">📚 Add New Student</button>
            <button className="w-full btn-primary text-left">👨‍🏫 Add New Teacher</button>
            <button className="w-full btn-primary text-left">📋 Take Attendance</button>
            <button className="w-full btn-primary text-left">🎯 Enter Exam Scores</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
