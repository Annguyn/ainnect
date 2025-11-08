import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLoginForm } from '../../components/admin/AdminLoginForm';
import { adminService } from '../../services/adminService';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (adminService.isAdminAuthenticated()) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  return <AdminLoginForm />;
};

