import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Login } from '../pages/Login';
import { Register } from '../components/Register';
import {Dashboard} from '../pages/Dashboard';
import { ProtectedRoute } from './ProtectedRoute';
import { MainLayout } from '../components/Layout/MainLayout';
import { authService } from '../features/auth/authService';
import { SharedSavingDetails } from '../pages/SharedSavingDetails';
import { ForgotPassword } from '../pages/ForgotPassword';
import { ResetPassword } from '../pages/ResetPassword';

const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return authService.isAuthenticated() ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Login
      onNavigateToRegister={() => navigate('/register')}
      onLoginSuccess={() => navigate('/dashboard')}
    />
  );
};

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Register
      onNavigateToLogin={() => navigate('/login')}
      onRegisterSuccess={() => navigate('/dashboard')}
    />
  );
};

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
        <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
        <Route path="/reset-password/:token" element={<PublicOnlyRoute><ResetPassword /></PublicOnlyRoute>} />

        {/* Rutas Protegidas dentro del MainLayout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/shared-savings/:code" element={<SharedSavingDetails />} />
          </Route>
        </Route>

        <Route
          path="*"
          element={<Navigate to={authService.isAuthenticated() ? "/dashboard" : "/login"} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
};