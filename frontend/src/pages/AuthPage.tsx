import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoginForm, RegisterForm } from '../components/auth';
import { AnimatedLogo } from '../components/AnimatedLogo';
import { ConnectionAnimation } from '../components/ConnectionAnimation';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  const getInitialMode = (): 'login' | 'register' => {
    const searchParams = new URLSearchParams(location.search);
    const modeParam = searchParams.get('mode');
    
    if (modeParam === 'register') return 'register';
    if (location.pathname === '/register') return 'register';
    return 'login';
  };

  const [mode, setMode] = useState<'login' | 'register'>(getInitialMode());
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showContent, setShowContent] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/profile');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    setMode(getInitialMode());
  }, [location.pathname, location.search]);

  const handleSuccess = () => {
    navigate('/profile');
  };

  const handleSwitchToRegister = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setShowContent(false);
    
    setTimeout(() => {
      setMode('register');
      navigate('/auth?mode=register');
      setShowContent(true);
      setTimeout(() => setIsTransitioning(false), 100);
    }, 300);
  };

  const handleSwitchToLogin = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setShowContent(false);
    
    setTimeout(() => {
      setMode('login');
      navigate('/auth?mode=login');
      setShowContent(true);
      setTimeout(() => setIsTransitioning(false), 100);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Left Panel - Animation */}
      <div className={`hidden lg:flex lg:w-1/2 transition-all duration-700 ease-in-out ${
        mode === 'login' ? 'order-1' : 'order-2'
      }`}>
        <ConnectionAnimation variant={mode} />
      </div>

      {/* Right Panel - Auth Form */}
      <div className={`w-full lg:w-1/2 flex flex-col justify-center px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-12 transition-all duration-700 ease-in-out ${
        mode === 'login' ? 'order-2' : 'order-1'
      }`}>
        {/* Mobile Logo */}
        <div className="lg:hidden text-center mb-4 sm:mb-6">
          <Link to="/" className="inline-flex flex-col items-center hover:opacity-80 transition-all duration-300">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-4">
              <AnimatedLogo size="md" />
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 via-secondary-600 to-tertiary-600 bg-clip-text text-transparent">
                ainnect
              </h1>
            </div>
            <p className="text-sm sm:text-base text-gray-600 font-medium px-2">
              Kết nối và chia sẻ với mọi người
            </p>
          </Link>
        </div>

        {/* Desktop Logo */}
        <div className="hidden lg:block text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-3 hover:opacity-80 transition-all duration-300">
            <AnimatedLogo size="md" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 via-secondary-600 to-tertiary-600 bg-clip-text text-transparent">
              ainnect
            </h1>
          </Link>
        </div>

        {/* Auth Form Container */}
        <div className="max-w-md mx-auto w-full">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 md:p-8 relative overflow-hidden">
            {/* Form background pattern */}
            <div className="absolute inset-0 opacity-5">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
                <defs>
                  <pattern id="formPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="10" cy="10" r="1" fill="currentColor" className="text-primary-400" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#formPattern)" />
              </svg>
            </div>
            
            {/* Form content with transition */}
            <div className={`relative transition-all duration-500 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              {mode === 'login' ? (
                <LoginForm
                  onSuccess={handleSuccess}
                  onSwitchToRegister={handleSwitchToRegister}
                />
              ) : (
                <RegisterForm
                  onSuccess={handleSuccess}
                  onSwitchToLogin={handleSwitchToLogin}
                />
              )}
            </div>
            
            {/* Loading overlay during transition */}
            {isTransitioning && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-4 sm:mt-6 md:mt-8">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <div className="w-1 h-1 bg-primary-400 rounded-full animate-pulse"></div>
                <span>Bảo mật cao</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-gray-300"></div>
              <div className="flex items-center space-x-1">
                <div className="w-1 h-1 bg-secondary-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <span>Kết nối nhanh</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-gray-300"></div>
              <div className="flex items-center space-x-1">
                <div className="w-1 h-1 bg-tertiary-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                <span>Miễn phí</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
