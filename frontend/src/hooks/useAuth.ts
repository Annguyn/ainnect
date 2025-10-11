import { useState, useCallback, useEffect } from 'react';
import { 
  LoginFormData, 
  RegisterFormData, 
  AuthState, 
  ValidationErrors, 
  LoginRequest,
  RegisterRequest
} from '../types';
import { authService } from '../services/authService';

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

export const validateUsername = (username: string): string | null => {
  if (!username) return 'Tên đăng nhập là bắt buộc';
  if (username.length < 3) return 'Tên đăng nhập phải có ít nhất 3 ký tự';
  if (username.length > 50) return 'Tên đăng nhập không được quá 50 ký tự';
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới';
  return null;
};

export const validatePhone = (phone: string): string | null => {
  if (!phone) return 'Số điện thoại là bắt buộc';
  const phoneRegex = /^\+84[0-9]{9,10}$/;
  if (!phoneRegex.test(phone)) return 'Số điện thoại không hợp lệ (định dạng: +84xxxxxxxxx)';
  return null;
};

export const validateDisplayName = (displayName: string): string | null => {
  if (!displayName || displayName.trim().length === 0) return 'Tên hiển thị là bắt buộc';
  if (displayName.trim().length > 65) return 'Tên hiển thị không được quá 65 ký tự';
  return null;
};

// Main authentication hook
export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(authService.getState());

  useEffect(() => {
    const unsubscribe = authService.subscribe(setAuthState);
    return unsubscribe;
  }, []);

  const login = useCallback(async (credentials: LoginFormData) => {
    try {
      const loginRequest: LoginRequest = {
        usernameOrEmail: credentials.usernameOrEmail,
        password: credentials.password,
      };
      
      await authService.login(loginRequest);
      return { success: true, user: authService.getCurrentUser() };
    } catch (error: any) {
      const errorMessage = error.message || 'Đăng nhập thất bại';
      return { success: false, error: errorMessage };
    }
  }, []);

  const register = useCallback(async (userData: RegisterFormData) => {
    try {
      const registerRequest: RegisterRequest = {
        username: userData.username,
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
        displayName: userData.displayName,
      };
      
      await authService.register(registerRequest);
      return { success: true, user: authService.getCurrentUser() };
    } catch (error: any) {
      const errorMessage = error.message || 'Đăng ký thất bại';
      return { success: false, error: errorMessage };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  const updateProfile = useCallback(async (profileData: any) => {
    try {
      const updatedUser = await authService.updateProfile(profileData);
      return { success: true, user: updatedUser };
    } catch (error: any) {
      const errorMessage = error.message || 'Cập nhật hồ sơ thất bại';
      return { success: false, error: errorMessage };
    }
  }, []);

  const clearError = useCallback(() => {
    authService.clearError();
  }, []);

  return {
    ...authState,
    login,
    register,
    logout,
    updateProfile,
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