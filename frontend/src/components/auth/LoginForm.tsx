import React, { useState } from 'react';
import { useAuth, useFormValidation, validateEmail, validatePassword } from '../../hooks/useAuth';
import { Button, Input, Alert } from '../ui';
import { LoginFormData } from '../../types';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchToRegister,
}) => {
  const { login, isLoading, error } = useAuth();
  const [showAlert, setShowAlert] = useState(false);

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    reset,
  } = useFormValidation<LoginFormData>(
    {
      usernameOrEmail: '',
      password: '',
      rememberMe: false,
    },
    {
      usernameOrEmail: (value) => {
        if (!value) return 'Email hoặc tên đăng nhập là bắt buộc';
        if (value.includes('@')) {
          return validateEmail(value);
        } else {
          if (value.length < 3) return 'Tên đăng nhập phải có ít nhất 3 ký tự';
          return null;
        }
      },
      password: validatePassword,
      rememberMe: () => null,
      email: () => null, // Optional legacy field
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAll()) {
      return;
    }

    try {
      const result = await login(values);
      if (result.success) {
        reset();
        onSuccess?.();
      } else {
        setShowAlert(true);
      }
    } catch (err) {
      setShowAlert(true);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fadeIn">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 animate-slideInDown">Đăng nhập</h2>
        <p className="text-gray-600 animate-slideInUp" style={{ animationDelay: '0.1s' }}>Chào mừng bạn trở lại với Ainnect</p>
      </div>

      {(error || showAlert) && (
        <Alert
          variant="error"
          className="mb-6"
          onClose={() => setShowAlert(false)}
        >
          <div>
            <h4 className="font-medium">Đăng nhập thất bại</h4>
            <p className="mt-1 text-sm">{error || 'Vui lòng kiểm tra lại thông tin đăng nhập'}</p>
          </div>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="animate-slideInLeft" style={{ animationDelay: '0.2s' }}>
          <Input
            type="text"
            label="Email hoặc tên đăng nhập"
            placeholder="Nhập email hoặc tên đăng nhập"
            value={values.usernameOrEmail}
            onChange={(e) => handleChange('usernameOrEmail', e.target.value)}
            onBlur={() => handleBlur('usernameOrEmail')}
            error={touched.usernameOrEmail ? errors.usernameOrEmail : undefined}
            required
          />
        </div>

        <div className="animate-slideInRight" style={{ animationDelay: '0.3s' }}>
          <Input
            type="password"
            label="Mật khẩu"
            placeholder="Nhập mật khẩu"
            value={values.password}
            onChange={(e) => handleChange('password', e.target.value)}
            onBlur={() => handleBlur('password')}
            error={touched.password ? errors.password : undefined}
            required
          />
        </div>

        <div className="flex items-center justify-between animate-fadeIn" style={{ animationDelay: '0.4s' }}>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={values.rememberMe}
              onChange={(e) => handleChange('rememberMe', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded transition-colors"
            />
            <span className="ml-2 text-sm text-gray-600">Ghi nhớ đăng nhập</span>
          </label>

          <button
            type="button"
            className="text-sm text-primary-600 hover:text-primary-500 transition-colors"
          >
            Quên mật khẩu?
          </button>
        </div>

        <div className="animate-slideInUp" style={{ animationDelay: '0.5s' }}>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            disabled={isLoading}
            className="w-full transform hover:scale-105 transition-transform"
          >
            Đăng nhập
          </Button>
        </div>

        <div className="text-center animate-fadeIn" style={{ animationDelay: '0.6s' }}>
          <p className="text-sm text-gray-600">
            Chưa có tài khoản?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-primary-600 hover:text-primary-500 font-medium transition-colors hover:underline"
            >
              Đăng ký ngay
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};
