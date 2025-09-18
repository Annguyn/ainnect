import { useState, useCallback } from 'react';
import { 
  LoginFormData, 
  RegisterFormData, 
  AuthState, 
  ValidationErrors, 
  User,
  AuthResponse 
} from '../types';

// Validation utilities
export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email là bắt buộc';
  if (!emailRegex.test(email)) return 'Email không hợp lệ';
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return 'Mật khẩu là bắt buộc';
  if (password.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự';
  if (!/(?=.*[a-z])/.test(password)) return 'Mật khẩu phải có ít nhất 1 chữ thường';
  if (!/(?=.*[A-Z])/.test(password)) return 'Mật khẩu phải có ít nhất 1 chữ hoa';
  if (!/(?=.*\d)/.test(password)) return 'Mật khẩu phải có ít nhất 1 số';
  return null;
};

export const validateName = (name: string): string | null => {
  if (!name) return 'Tên là bắt buộc';
  if (name.length < 2) return 'Tên phải có ít nhất 2 ký tự';
  if (!/^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]*$/.test(name)) {
    return 'Tên chỉ được chứa chữ cái';
  }
  return null;
};

export const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
  if (!confirmPassword) return 'Xác nhận mật khẩu là bắt buộc';
  if (password !== confirmPassword) return 'Mật khẩu xác nhận không khớp';
  return null;
};

// Mock API functions (replace with real API calls)
const mockLogin = async (credentials: LoginFormData): Promise<AuthResponse> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (credentials.email === 'test@ainnect.com' && credentials.password === 'Password123') {
        const user: User = {
          id: '1',
          email: credentials.email,
          firstName: 'John',
          lastName: 'Doe',
          avatar: 'https://i.pravatar.cc/150',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        resolve({
          user,
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        });
      } else {
        reject(new Error('Email hoặc mật khẩu không chính xác'));
      }
    }, 1500);
  });
};

const mockRegister = async (userData: RegisterFormData): Promise<AuthResponse> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (userData.email === 'existing@ainnect.com') {
        reject(new Error('Email này đã được sử dụng'));
      } else {
        const user: User = {
          id: '2',
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          avatar: 'https://i.pravatar.cc/150',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        resolve({
          user,
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        });
      }
    }, 2000);
  });
};

// Main authentication hook
export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: false,
    error: null,
  });

  const login = useCallback(async (credentials: LoginFormData) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await mockLogin(credentials);
      setAuthState({
        isAuthenticated: true,
        user: response.user,
        isLoading: false,
        error: null,
      });
      
      // Store tokens (in a real app, use secure storage)
      if (credentials.rememberMe) {
        localStorage.setItem('ainnect_tokens', JSON.stringify({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        }));
      }
      
      return { success: true, user: response.user };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Đăng nhập thất bại';
      setAuthState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const register = useCallback(async (userData: RegisterFormData) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await mockRegister(userData);
      setAuthState({
        isAuthenticated: true,
        user: response.user,
        isLoading: false,
        error: null,
      });
      
      // Store tokens
      localStorage.setItem('ainnect_tokens', JSON.stringify({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      }));
      
      return { success: true, user: response.user };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Đăng ký thất bại';
      setAuthState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const logout = useCallback(() => {
    setAuthState({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null,
    });
    localStorage.removeItem('ainnect_tokens');
  }, []);

  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...authState,
    login,
    register,
    logout,
    clearError,
  };
};

// Form validation hook
export const useFormValidation = <T extends Record<string, any>>(
  initialValues: T,
  validationRules: Record<keyof T, (value: any, formData?: T) => string | null>
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);

  const validateField = useCallback((name: keyof T, value: any) => {
    const rule = validationRules[name];
    if (rule) {
      return rule(value, values);
    }
    return null;
  }, [validationRules, values]);

  const handleChange = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as string]) {
      setErrors(prev => ({ ...prev, [name as string]: '' }));
    }
  }, [errors]);

  const handleBlur = useCallback((name: keyof T) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name as string]: error || '' }));
  }, [validateField, values]);

  const validateAll = useCallback(() => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(key => {
      const error = validateField(key as keyof T, values[key as keyof T]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(Object.keys(validationRules).reduce((acc, key) => {
      acc[key as keyof T] = true;
      return acc;
    }, {} as Record<keyof T, boolean>));

    return isValid;
  }, [validationRules, validateField, values]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({} as Record<keyof T, boolean>);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    isValid: Object.keys(errors).length === 0 || Object.values(errors).every(error => !error),
  };
};