import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  Link,
  Alert,
  IconButton,
  InputAdornment,
  Divider,
  useMediaQuery,
  useTheme,
  Fade,
  Slide,
  CircularProgress,
  Grid,
  LinearProgress,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Google,
  Facebook,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { gradients, brandColors } from '../theme/authTheme';
import {
  useAuth,
  useFormValidation,
  validateEmail,
  validatePassword,
  validateName,
  validateConfirmPassword
} from '../hooks/useAuth';
import { LoginFormData, RegisterFormData } from '../types';
import '../styles/authAnimations.css';

// Password strength indicator
const PasswordStrength: React.FC<{ password: string }> = ({ password }) => {
  const getStrength = () => {
    let score = 0;
    if (password.length >= 8) score += 25;
    if (/[a-z]/.test(password)) score += 25;
    if (/[A-Z]/.test(password)) score += 25;
    if (/\d/.test(password)) score += 25;
    return score;
  };

  const strength = getStrength();
  const getColor = () => {
    if (strength < 50) return 'error';
    if (strength < 75) return 'warning';
    return 'success';
  };

  const getLabel = () => {
    if (strength < 50) return 'Yếu';
    if (strength < 75) return 'Trung bình';
    return 'Mạnh';
  };

  if (!password) return null;

  return (
    <Box sx={{ mt: 1 }} className="password-strength-bar">
      <LinearProgress
        variant="determinate"
        value={strength}
        color={getColor()}
        sx={{ height: 4, borderRadius: 2 }}
        className={`password-strength-${getLabel().toLowerCase()}`}
      />
      <Typography variant="caption" color={`${getColor()}.main`} sx={{ mt: 0.5, display: 'block' }}>
        Độ mạnh mật khẩu: {getLabel()}
      </Typography>
    </Box>
  );
};

const Auth: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  
  // Determine initial tab based on URL
  const getInitialTab = (): 'login' | 'register' => {
    if (location.pathname === '/register') return 'register';
    return 'login';
  };
  
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(getInitialTab());
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const { login, register, isLoading, error, clearError } = useAuth();

  // Login form validation
  const loginForm = useFormValidation<LoginFormData>(
    {
      email: '',
      password: '',
      rememberMe: false,
    },
    {
      email: validateEmail,
      password: validatePassword,
      rememberMe: () => null,
    }
  );

  // Register form validation
  const registerForm = useFormValidation<RegisterFormData>(
    {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    },
    {
      firstName: validateName,
      lastName: validateName,
      email: validateEmail,
      password: validatePassword,
      confirmPassword: (value, formData) => validateConfirmPassword(formData?.password || '', value),
      agreeToTerms: (value) => value ? null : 'Bạn phải đồng ý với điều khoản sử dụng',
    }
  );

  useEffect(() => {
    setMounted(true);
    return () => clearError();
  }, [clearError]);

  // Update tab when URL changes
  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [location.pathname]);

  const handleTabChange = (newTab: 'login' | 'register') => {
    setActiveTab(newTab);
    clearError();
    loginForm.reset();
    registerForm.reset();
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginForm.validateAll()) {
      return;
    }

    const result = await login(loginForm.values);
    if (result.success) {
      window.location.href = '/profile';
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerForm.validateAll()) {
      return;
    }

    const result = await register(registerForm.values);
    if (result.success) {
      window.location.href = '/profile';
    }
  };

  const handleSocialAuth = (provider: string) => {
    console.log(`${activeTab === 'login' ? 'Login' : 'Register'} with ${provider}`);
  };

  return (
    <Box
      className="auth-container"
      sx={{
        minHeight: 'calc(100vh - 70px)',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? 2 : 4,
        position: 'relative',
      }}
    >
      <Slide direction="up" in={mounted} timeout={800}>
        <Card
          className="auth-card"
          sx={{
            maxWidth: activeTab === 'register' ? 520 : 450,
            width: '100%',
            position: 'relative',
            backgroundColor: '#ffffff',
            border: '1px solid #f1f5f9',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            transition: 'all 0.3s ease',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #E91E63, #9C27B0, #2196F3, #03DAC6)',
              borderRadius: '16px 16px 0 0',
            }
          }}
        >
          <CardContent sx={{ p: isMobile ? 3 : 4 }}>
            {/* Logo and Header */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Fade in={mounted} timeout={1000}>
                <Typography
                  variant="h3"
                  className="auth-logo"
                  sx={{
                    fontFamily: '"Nunito", "Poppins", "Inter", sans-serif',
                    fontWeight: 900,
                    mb: 2,
                    letterSpacing: '-0.03em',
                    fontSize: { xs: '2.2rem', sm: '2.8rem' },
                    background: 'linear-gradient(135deg, #E91E63 0%, #9C27B0 50%, #2196F3 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textAlign: 'center',
                    position: 'relative',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: '120%',
                      height: '120%',
                      background: 'radial-gradient(circle, rgba(233,30,99,0.1) 0%, rgba(156,39,176,0.1) 50%, rgba(33,150,243,0.1) 100%)',
                      transform: 'translate(-50%, -50%)',
                      borderRadius: '50%',
                      zIndex: -1,
                      opacity: 0.6,
                      filter: 'blur(20px)'
                    }
                  }}
                >
                  ainnect
                </Typography>
              </Fade>
            </Box>

            {/* Tab Navigation */}
            <Box sx={{ mb: 3 }}>
              <Tabs
                value={activeTab}
                onChange={(_, newValue) => handleTabChange(newValue)}
                centered
                sx={{
                  '& .MuiTabs-indicator': {
                    background: gradients.primary,
                    height: '3px',
                    borderRadius: '2px',
                  },
                  '& .MuiTab-root': {
                    fontWeight: 600,
                    fontSize: '1rem',
                    textTransform: 'none',
                    color: '#64748b',
                    transition: 'all 0.3s ease',
                    '&.Mui-selected': {
                      background: 'linear-gradient(135deg, #E91E63, #9C27B0, #2196F3)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }
                  }
                }}
              >
                <Tab 
                  value="login" 
                  label="Đăng nhập" 
                  icon={<LoginIcon />}
                  iconPosition="start"
                />
                <Tab 
                  value="register" 
                  label="Đăng ký" 
                  icon={<PersonAddIcon />}
                  iconPosition="start"
                />
              </Tabs>
            </Box>

            {/* Error Alert */}
            {error && (
              <Fade in={Boolean(error)}>
                <Alert
                  severity="error"
                  className="auth-error"
                  sx={{ mb: 3 }}
                  onClose={clearError}
                >
                  {error}
                </Alert>
              </Fade>
            )}

            {/* Login Form */}
            {activeTab === 'login' && (
              <Fade in={activeTab === 'login'} timeout={300}>
                <Box component="form" onSubmit={handleLoginSubmit} noValidate>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={loginForm.values.email}
                    onChange={(e) => loginForm.handleChange('email', e.target.value)}
                    onBlur={() => loginForm.handleBlur('email')}
                    error={loginForm.touched.email && Boolean(loginForm.errors.email)}
                    helperText={loginForm.touched.email && loginForm.errors.email}
                    className="auth-form-field"
                    sx={{ mb: 3 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color="action" />
                        </InputAdornment>
                      ),
                    }}
                    placeholder="Nhập địa chỉ email"
                  />

                  <TextField
                    fullWidth
                    label="Mật khẩu"
                    type={showPassword ? 'text' : 'password'}
                    value={loginForm.values.password}
                    onChange={(e) => loginForm.handleChange('password', e.target.value)}
                    onBlur={() => loginForm.handleBlur('password')}
                    error={loginForm.touched.password && Boolean(loginForm.errors.password)}
                    helperText={loginForm.touched.password && loginForm.errors.password}
                    className="auth-form-field"
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            aria-label="toggle password visibility"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    placeholder="Nhập mật khẩu"
                  />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={loginForm.values.rememberMe}
                          onChange={(e) => loginForm.handleChange('rememberMe', e.target.checked)}
                          size="small"
                        />
                      }
                      label="Ghi nhớ đăng nhập"
                      sx={{ fontSize: '0.875rem' }}
                    />
                    <Link
                      href="#"
                      variant="body2"
                      className="auth-link"
                      sx={{
                        color: brandColors.primary.main,
                        textDecoration: 'none',
                      }}
                    >
                      Quên mật khẩu?
                    </Link>
                  </Box>

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={isLoading}
                    className="auth-submit-button"
                    sx={{
                      mb: 3,
                      py: 1.5,
                      fontSize: '1rem',
                      background: gradients.primary,
                      '&:hover': {
                        background: gradients.primary,
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(233, 30, 99, 0.3)',
                      },
                    }}
                  >
                    {isLoading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      'Đăng nhập'
                    )}
                  </Button>
                </Box>
              </Fade>
            )}

            {/* Register Form */}
            {activeTab === 'register' && (
              <Fade in={activeTab === 'register'} timeout={300}>
                <Box component="form" onSubmit={handleRegisterSubmit} noValidate>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Tên"
                        value={registerForm.values.firstName}
                        onChange={(e) => registerForm.handleChange('firstName', e.target.value)}
                        onBlur={() => registerForm.handleBlur('firstName')}
                        error={registerForm.touched.firstName && Boolean(registerForm.errors.firstName)}
                        helperText={registerForm.touched.firstName && registerForm.errors.firstName}
                        className="auth-form-field"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person color="action" />
                            </InputAdornment>
                          ),
                        }}
                        placeholder="Tên của bạn"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Họ"
                        value={registerForm.values.lastName}
                        onChange={(e) => registerForm.handleChange('lastName', e.target.value)}
                        onBlur={() => registerForm.handleBlur('lastName')}
                        error={registerForm.touched.lastName && Boolean(registerForm.errors.lastName)}
                        helperText={registerForm.touched.lastName && registerForm.errors.lastName}
                        className="auth-form-field"
                        placeholder="Họ của bạn"
                      />
                    </Grid>
                  </Grid>

                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={registerForm.values.email}
                    onChange={(e) => registerForm.handleChange('email', e.target.value)}
                    onBlur={() => registerForm.handleBlur('email')}
                    error={registerForm.touched.email && Boolean(registerForm.errors.email)}
                    helperText={registerForm.touched.email && registerForm.errors.email}
                    className="auth-form-field"
                    sx={{ mt: 2, mb: 2 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color="action" />
                        </InputAdornment>
                      ),
                    }}
                    placeholder="Nhập địa chỉ email"
                  />

                  <TextField
                    fullWidth
                    label="Mật khẩu"
                    type={showPassword ? 'text' : 'password'}
                    value={registerForm.values.password}
                    onChange={(e) => registerForm.handleChange('password', e.target.value)}
                    onBlur={() => registerForm.handleBlur('password')}
                    error={registerForm.touched.password && Boolean(registerForm.errors.password)}
                    helperText={registerForm.touched.password && registerForm.errors.password}
                    className="auth-form-field"
                    sx={{ mb: 1 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            aria-label="toggle password visibility"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    placeholder="Tạo mật khẩu mạnh"
                  />

                  <PasswordStrength password={registerForm.values.password} />

                  <TextField
                    fullWidth
                    label="Xác nhận mật khẩu"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={registerForm.values.confirmPassword}
                    onChange={(e) => registerForm.handleChange('confirmPassword', e.target.value)}
                    onBlur={() => registerForm.handleBlur('confirmPassword')}
                    error={registerForm.touched.confirmPassword && Boolean(registerForm.errors.confirmPassword)}
                    helperText={registerForm.touched.confirmPassword && registerForm.errors.confirmPassword}
                    className="auth-form-field"
                    sx={{ mt: 2, mb: 2 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                            aria-label="toggle confirm password visibility"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    placeholder="Nhập lại mật khẩu"
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={registerForm.values.agreeToTerms}
                        onChange={(e) => registerForm.handleChange('agreeToTerms', e.target.checked)}
                        size="small"
                        color="primary"
                        className="auth-checkbox"
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ color: '#64748b' }}>
                        Tôi đồng ý với{' '}
                        <Link
                          href="#"
                          sx={{
                            color: brandColors.primary.main,
                            textDecoration: 'none',
                            '&:hover': { textDecoration: 'underline' },
                          }}
                        >
                          Điều khoản sử dụng
                        </Link>{' '}
                        và{' '}
                        <Link
                          href="#"
                          sx={{
                            color: brandColors.primary.main,
                            textDecoration: 'none',
                            '&:hover': { textDecoration: 'underline' },
                          }}
                        >
                          Chính sách bảo mật
                        </Link>
                      </Typography>
                    }
                    sx={{ 
                      mb: 3, 
                      alignItems: 'flex-start',
                      ...(registerForm.touched.agreeToTerms && registerForm.errors.agreeToTerms && {
                        '& .MuiFormControlLabel-label': {
                          color: 'error.main'
                        }
                      })
                    }}
                  />

                  {registerForm.touched.agreeToTerms && registerForm.errors.agreeToTerms && (
                    <Typography variant="caption" color="error" sx={{ display: 'block', mt: -2, mb: 2 }}>
                      {registerForm.errors.agreeToTerms}
                    </Typography>
                  )}

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={isLoading}
                    className="auth-submit-button"
                    sx={{
                      mb: 3,
                      py: 1.5,
                      fontSize: '1rem',
                      background: gradients.secondary,
                      '&:hover': {
                        background: gradients.secondary,
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(33, 150, 243, 0.3)',
                      },
                    }}
                  >
                    {isLoading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      'Tạo tài khoản'
                    )}
                  </Button>
                </Box>
              </Fade>
            )}

            {/* Social Authentication */}
            <Divider sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Hoặc {activeTab === 'login' ? 'đăng nhập' : 'đăng ký'} với
              </Typography>
            </Divider>

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handleSocialAuth('google')}
                className="auth-social-button"
                sx={{
                  py: 1,
                  borderColor: '#e2e8f0',
                  color: '#64748b',
                  '&:hover': {
                    borderColor: brandColors.primary.main,
                    backgroundColor: 'rgba(233, 30, 99, 0.04)',
                  },
                }}
              >
                <Google sx={{ mr: 1 }} />
                Google
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handleSocialAuth('facebook')}
                className="auth-social-button"
                sx={{
                  py: 1,
                  borderColor: '#e2e8f0',
                  color: '#64748b',
                  '&:hover': {
                    borderColor: brandColors.tertiary.main,
                    backgroundColor: 'rgba(33, 150, 243, 0.04)',
                  },
                }}
              >
                <Facebook sx={{ mr: 1 }} />
                Facebook
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Slide>
    </Box>
  );
};

export default Auth;