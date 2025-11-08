import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { adminService } from '../../services/adminService';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = adminService.isAdminAuthenticated();

  useEffect(() => {
    if (!isAuthenticated) {
      console.log('Admin not authenticated, redirecting to login');
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

