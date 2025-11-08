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

          {/* Download App Section */}
          <div className="mt-6 sm:mt-8">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85a.637.637 0 0 0-.83.22l-1.88 3.24a11.43 11.43 0 0 0-8.94 0L5.65 5.67a.643.643 0 0 0-.87-.2c-.28.18-.37.54-.22.83L6.4 9.48A10.81 10.81 0 0 0 1 18h22a10.81 10.81 0 0 0-5.4-8.52zM7 15.25a1.25 1.25 0 1 1 2.5 0 1.25 1.25 0 0 1-2.5 0zm7.5 0a1.25 1.25 0 1 1 2.5 0 1.25 1.25 0 0 1-2.5 0z"/>
                      </svg>
                      <h3 className="text-base sm:text-lg font-bold">Tải ứng dụng Android</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-blue-100 mb-3 sm:mb-4">
                      Trải nghiệm Ainnect mọi lúc, mọi nơi trên thiết bị di động của bạn
                    </p>
                    <Link
                      to="/download"
                      className="inline-flex items-center bg-white text-blue-600 hover:bg-blue-50 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-xl transform hover:scale-105"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Tải xuống ngay
                    </Link>
                  </div>
                  
                  {/* Phone mockup */}
                  <div className="hidden sm:block ml-4">
                    <div className="relative w-20 h-32 sm:w-24 sm:h-40">
                      <div className="absolute inset-0 bg-gray-900 rounded-2xl shadow-2xl transform rotate-6 hover:rotate-0 transition-transform duration-300">
                        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gray-800 rounded-full"></div>
                        <img
                          src="/img_mobile_2.png"
                          alt="Ainnect App"
                          className="w-full h-full object-cover rounded-2xl p-1"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-xs sm:text-sm text-blue-100 pt-3 border-t border-white/20">
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>4.8 ★</span>
                  </div>
                  <div className="w-px h-3 bg-white/30"></div>
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                    <span>10K+ tải xuống</span>
                  </div>
                  <div className="w-px h-3 bg-white/30"></div>
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Miễn phí</span>
                  </div>
                </div>
              </div>
            </div>
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
