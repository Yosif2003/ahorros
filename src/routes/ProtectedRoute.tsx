import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../features/auth/authService';

type ProtectedRouteProps = {
  redirectTo?: string;
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ redirectTo = '/login' }) => {
  const isAuth = authService.isAuthenticated();

  if (!isAuth) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};