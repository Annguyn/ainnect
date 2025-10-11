import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoginForm, RegisterForm } from '../components/auth';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  // Determine initial mode based on URL
  const getInitialMode = (): 'login' | 'register' => {
    if (location.pathname === '/register') return 'register';
    return 'login';
  };

  const [mode, setMode] = useState<'login' | 'register'>(getInitialMode());

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/profile');
    }
  }, [isAuthenticated, navigate]);

  // Update mode when URL changes
  useEffect(() => {
    setMode(getInitialMode());
  }, [location.pathname]);

  const handleSuccess = () => {
    navigate('/profile');
  };

  const handleSwitchToRegister = () => {
    setMode('register');
    navigate('/register');
  };

  const handleSwitchToLogin = () => {
    setMode('login');
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-tertiary-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-tertiary-200 rounded-full opacity-10 blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo and branding */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center hover:opacity-80 transition-opacity">
            <div className="flex items-center space-x-3 mb-2">
              <img 
                src="/favicon.ico" 
                alt="Ainnect Logo" 
                className="w-12 h-12"
              />
              <h1 className="text-4xl font-bold bg-brand-gradient bg-clip-text text-transparent">
                ainnect
              </h1>
            </div>
            <p className="text-gray-600">
              Kết nối và chia sẻ với mọi người
            </p>
          </Link>
        </div>

        {/* Auth card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
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

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
