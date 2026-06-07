import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Store
import { useAuthStore } from '@/store/authStore';

// Pages
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import StudentsPage from '@/pages/StudentsPage';
import TeachersPage from '@/pages/TeachersPage';
import ClassesPage from '@/pages/ClassesPage';
import SubjectsPage from '@/pages/SubjectsPage';
import AttendancePage from '@/pages/AttendancePage';
import ExamsPage from '@/pages/ExamsPage';
import GradesPage from '@/pages/GradesPage';
import FeesPage from '@/pages/FeesPage';
import ReportCardsPage from '@/pages/ReportCardsPage';
import NotFoundPage from '@/pages/NotFoundPage';

// Layouts
import MainLayout from '@/layouts/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route
            path="/login"
            element={
              <AuthLayout>
                <LoginPage />
              </AuthLayout>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <DashboardPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/students"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <StudentsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/teachers"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <TeachersPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/classes"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ClassesPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/subjects"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <SubjectsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/attendance"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <AttendancePage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/exams"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ExamsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/grades"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <GradesPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/fees"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <FeesPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/report-cards"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ReportCardsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* 404 Page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
