import React, { useState } from 'react';
import { useAuth, useFormValidation, validateEmail, validatePassword, validateConfirmPassword, validateUsername, validatePhone, validateDisplayName } from '../../hooks/useAuth';
import { Button, Input, Alert } from '../ui';
import { RegisterFormData } from '../../types';
import { userService } from '../../services/api';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onSwitchToLogin,
}) => {
  const { register, isLoading, error } = useAuth();
  const [serverFieldErrors, setServerFieldErrors] = useState<{ username?: string; email?: string; displayName?: string }>();
  const [serverErrorMessage, setServerErrorMessage] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    reset,
  } = useFormValidation<RegisterFormData>(
    {
      username: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      displayName: '',
      agreeToTerms: false,
      firstName: '',
      lastName: '',
    },
    {
      username: validateUsername,
      email: validateEmail,
      phone: (value) => (value ? validatePhone(value) : null),
      password: validatePassword,
      confirmPassword: (value, formData) => validateConfirmPassword(formData?.password || '', value),
      displayName: validateDisplayName,
      agreeToTerms: (value) => !value ? 'Bạn phải đồng ý với điều khoản sử dụng' : null,
      firstName: () => null, // Optional field
      lastName: () => null, // Optional field
    }
  );

  const checkUsernameAvailability = async (username: string) => {
    if (!username || validateUsername(username)) return;
    
    setIsCheckingUsername(true);
    try {
      const exists = await userService.checkUsernameExists(username);
      if (exists) {
        return 'Tên đăng nhập đã được sử dụng';
      }
    } catch (err) {
      console.error('Error checking username:', err);
    } finally {
      setIsCheckingUsername(false);
    }
    return null;
  };

  const checkEmailAvailability = async (email: string) => {
    if (!email || validateEmail(email)) return;
    
    setIsCheckingEmail(true);
    try {
      const exists = await userService.checkEmailExists(email);
      if (exists) {
        return 'Email đã được sử dụng';
      }
    } catch (err) {
      console.error('Error checking email:', err);
    } finally {
      setIsCheckingEmail(false);
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAll()) {
      return;
    }

    // Hard guard for displayName (avoid sending to backend)
    const trimmedName = (values.displayName || '').trim();
    if (trimmedName.length === 0) {
      setServerFieldErrors(prev => ({ ...(prev || {}), displayName: 'Tên hiển thị là bắt buộc' }));
      setShowAlert(true);
      return;
    }
    if (trimmedName.length > 65) {
      setServerFieldErrors(prev => ({ ...(prev || {}), displayName: 'Tên hiển thị không được quá 65 ký tự' }));
      setShowAlert(true);
      return;
    }

    // Additional validation for username and email availability
    const usernameError = await checkUsernameAvailability(values.username);
    const emailError = await checkEmailAvailability(values.email);
    if (usernameError || emailError) {
      setServerFieldErrors({
        username: usernameError || undefined,
        email: emailError || undefined,
      });
      setServerErrorMessage(usernameError || emailError || null);
      setShowAlert(true);
      return;
    }

    try {
      const result = await register(values);
      if (result.success) {
        reset();
        setServerFieldErrors(undefined);
        setServerErrorMessage(null);
        setShowAlert(false);
        onSuccess?.();
      } else {
        setShowAlert(true);
        const msg = result.error || '';
        setServerErrorMessage(msg || null);
        const nextFieldErrors: { username?: string; email?: string } = {};
        if (/username.+tồn tại|username.+đã tồn tại|Tên đăng nhập.+đã tồn tại/i.test(msg)) {
          nextFieldErrors.username = 'Tên đăng nhập đã tồn tại';
        }
        if (/email.+tồn tại|email.+đã tồn tại/i.test(msg)) {
          nextFieldErrors.email = 'Email đã tồn tại';
        }
        setServerFieldErrors(nextFieldErrors);
      }
    } catch (err: any) {
      setShowAlert(true);
      const msg = err?.message || '';
      setServerErrorMessage(msg || null);
      const nextFieldErrors: { username?: string; email?: string } = {};
      if (/username.+tồn tại|username.+đã tồn tại|Tên đăng nhập.+đã tồn tại/i.test(msg)) {
        nextFieldErrors.username = 'Tên đăng nhập đã tồn tại';
      }
      if (/email.+tồn tại|email.+đã tồn tại/i.test(msg)) {
        nextFieldErrors.email = 'Email đã tồn tại';
      }
      setServerFieldErrors(nextFieldErrors);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fadeIn">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 animate-slideInDown">Đăng ký</h2>
        <p className="text-gray-600 animate-slideInUp" style={{ animationDelay: '0.1s' }}>Tạo tài khoản mới để tham gia Ainnect</p>
      </div>

      {(showAlert || error) && (
        <Alert
          variant="error"
          className="mb-6"
          onClose={() => setShowAlert(false)}
        >
          <div>
            <h4 className="font-medium">Đăng ký thất bại</h4>
            <p className="mt-1 text-sm">{serverErrorMessage || error || 'Vui lòng kiểm tra lại thông tin đăng ký'}</p>
          </div>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          type="text"
          label="Tên đăng nhập"
          placeholder="Nhập tên đăng nhập"
          value={values.username}
          onChange={(e) => handleChange('username', e.target.value)}
          onBlur={() => handleBlur('username')}
          error={serverFieldErrors?.username || (touched.username ? errors.username : undefined)}
          helperText={isCheckingUsername ? 'Đang kiểm tra...' : undefined}
          required
        />

        <Input
          type="email"
          label="Email"
          placeholder="Nhập địa chỉ email"
          value={values.email}
          onChange={(e) => handleChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
          error={serverFieldErrors?.email || (touched.email ? errors.email : undefined)}
          helperText={isCheckingEmail ? 'Đang kiểm tra...' : undefined}
          required
        />

        <Input
          type="tel"
          label="Số điện thoại (không bắt buộc)"
          placeholder="+84123456789"
          value={values.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          onBlur={() => handleBlur('phone')}
          error={touched.phone ? errors.phone : undefined}
        />

        <Input
          type="text"
          label="Tên hiển thị"
          placeholder="Nhập tên hiển thị"
          value={values.displayName}
          onChange={(e) => handleChange('displayName', e.target.value)}
          onBlur={() => handleBlur('displayName')}
          error={serverFieldErrors?.displayName || (touched.displayName ? errors.displayName : undefined)}
          helperText="Quy định: tối đa 65 ký tự, không được để trống"
          required
        />

        <Input
          type="password"
          label="Mật khẩu"
          placeholder="Nhập mật khẩu"
          value={values.password}
          onChange={(e) => handleChange('password', e.target.value)}
          onBlur={() => handleBlur('password')}
          error={touched.password ? errors.password : undefined}
          helperText="Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số"
          required
        />

        <Input
          type="password"
          label="Xác nhận mật khẩu"
          placeholder="Nhập lại mật khẩu"
          value={values.confirmPassword}
          onChange={(e) => handleChange('confirmPassword', e.target.value)}
          onBlur={() => handleBlur('confirmPassword')}
          error={touched.confirmPassword ? errors.confirmPassword : undefined}
          required
        />

        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              type="checkbox"
              checked={values.agreeToTerms}
              onChange={(e) => handleChange('agreeToTerms', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label className="text-gray-600">
              Tôi đồng ý với{' '}
              <button type="button" className="text-primary-600 hover:text-primary-500">
                Điều khoản sử dụng
              </button>{' '}
              và{' '}
              <button type="button" className="text-primary-600 hover:text-primary-500">
                Chính sách bảo mật
              </button>
            </label>
            {touched.agreeToTerms && errors.agreeToTerms && (
              <p className="mt-1 text-xs text-red-600">{errors.agreeToTerms}</p>
            )}
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          disabled={isLoading || isCheckingUsername || isCheckingEmail}
          className="w-full"
        >
          Đăng ký
        </Button>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Đã có tài khoản?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-primary-600 hover:text-primary-500 font-medium"
            >
              Đăng nhập ngay
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};
