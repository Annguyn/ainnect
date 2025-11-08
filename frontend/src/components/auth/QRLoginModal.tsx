import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { qrLoginService, QRSession, QRLoginStatus } from '../../services/qrLoginService';
import { useAuth } from '../../hooks/useAuth';
import { debugLogger } from '../../utils/debugLogger';

interface QRLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const QRLoginModal: React.FC<QRLoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { login } = useAuth();
  const [qrSession, setQrSession] = useState<QRSession | null>(null);
  const [status, setStatus] = useState<QRLoginStatus>('PENDING');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const generateQR = async () => {
    setLoading(true);
    setError(null);
    setStatus('PENDING');
    
    try {
      const session = await qrLoginService.generateQRCode();
      setQrSession(session);
      setTimeLeft(session.expiresInSeconds);
      startPolling(session.sessionId);
      startCountdown();
      
      debugLogger.log('QRLoginModal', 'QR code generated and polling started', {
        sessionId: session.sessionId,
        expiresIn: session.expiresInSeconds
      });
    } catch (err: any) {
      console.error('Failed to generate QR code:', err);
      setError('Không thể tạo mã QR. Vui lòng thử lại.');
      debugLogger.log('QRLoginModal', 'Failed to generate QR code', { error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (sessionId: string) => {
    // Clear existing polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Poll every 2 seconds
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const statusResponse = await qrLoginService.checkStatus(sessionId);
        setStatus(statusResponse.status);

        if (statusResponse.status === 'CONFIRMED' && statusResponse.token) {
          // Stop polling
          stopPolling();
          
          debugLogger.log('QRLoginModal', 'QR login confirmed, logging in user', {
            userId: statusResponse.user?.userId,
            username: statusResponse.user?.username
          });

          // Login with the token
          await login(statusResponse.token);
          
          // Call success callback
          if (onSuccess) {
            onSuccess();
          }
          
          // Close modal
          onClose();
        } else if (statusResponse.status === 'EXPIRED' || statusResponse.status === 'CANCELLED') {
          // Stop polling
          stopPolling();
          
          debugLogger.log('QRLoginModal', `QR login ${statusResponse.status.toLowerCase()}`, {
            sessionId
          });
        }
      } catch (err) {
        console.error('Failed to check QR status:', err);
        // Don't set error for polling failures, just log them
      }
    }, 2000);
  };

  const startCountdown = () => {
    // Clear existing countdown
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    countdownIntervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          stopPolling();
          setStatus('EXPIRED');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  };

  const handleRefresh = () => {
    stopPolling();
    generateQR();
  };

  useEffect(() => {
    if (isOpen && !qrSession) {
      generateQR();
    }

    return () => {
      stopPolling();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusUI = () => {
    switch (status) {
      case 'PENDING':
        return {
          icon: '📱',
          title: 'Quét mã QR để đăng nhập',
          description: 'Mở ứng dụng Ainnect trên điện thoại và quét mã QR này',
          gradientClass: 'from-blue-600 to-blue-700'
        };
      case 'CONFIRMED':
        return {
          icon: '✅',
          title: 'Đăng nhập thành công!',
          description: 'Đang chuyển hướng...',
          gradientClass: 'from-green-600 to-green-700'
        };
      case 'EXPIRED':
        return {
          icon: '⏱️',
          title: 'Mã QR đã hết hạn',
          description: 'Vui lòng tạo mã QR mới để tiếp tục',
          gradientClass: 'from-red-600 to-red-700'
        };
      case 'CANCELLED':
        return {
          icon: '❌',
          title: 'Đăng nhập bị hủy',
          description: 'Bạn đã hủy đăng nhập từ thiết bị di động',
          gradientClass: 'from-red-600 to-red-700'
        };
    }
  };

  const statusUI = getStatusUI();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Đăng nhập bằng QR"
      size="lg"
    >
      <div className="relative overflow-y-auto max-h-[80vh] -m-6 p-6">
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 opacity-10"></div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 animate-fadeIn">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200"></div>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
            </div>
            <p className="text-gray-700 mt-4 font-medium">Đang tạo mã QR...</p>
            <p className="text-gray-500 text-sm mt-1">Vui lòng chờ trong giây lát</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 animate-fadeIn">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mb-3 animate-bounce">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Oops! Có lỗi xảy ra</h3>
            <p className="text-red-600 mb-4 text-center max-w-sm text-sm">{error}</p>
            <Button 
              onClick={generateQR} 
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Thử lại
            </Button>
          </div>
        ) : qrSession ? (
          <div className="flex flex-col items-center animate-fadeIn">
            {/* Status Icon & Title */}
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mb-3 animate-pulse">
                <div className="text-4xl">{statusUI.icon}</div>
              </div>
              <h3 className={`text-xl font-bold mb-1 bg-gradient-to-r ${statusUI.gradientClass} bg-clip-text text-transparent`}>
                {statusUI.title}
              </h3>
              <p className="text-gray-600 text-sm">{statusUI.description}</p>
            </div>

            {/* QR Code */}
            {status === 'PENDING' && (
              <>
                {/* QR Code with fancy border */}
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-3xl blur-xl opacity-20 animate-pulse"></div>
                  <div className="relative bg-white p-4 rounded-2xl shadow-2xl border-2 border-gray-100">
                    <img
                      src={qrSession.qrCodeImage}
                      alt="QR Code"
                      className="w-56 h-56"
                    />
                    {/* Corner decorations */}
                    <div className="absolute top-2 left-2 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                    <div className="absolute top-2 right-2 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                    <div className="absolute bottom-2 left-2 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                    <div className="absolute bottom-2 right-2 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
                  </div>
                </div>

                {/* Timer with gradient background */}
                <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full mb-3 ${
                  timeLeft < 60 
                    ? 'bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200' 
                    : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200'
                }`}>
                  <svg className={`w-4 h-4 ${timeLeft < 60 ? 'text-red-600' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className={`font-mono text-lg font-bold ${timeLeft < 60 ? 'text-red-700' : 'text-blue-700'}`}>
                    {formatTime(timeLeft)}
                  </span>
                  {timeLeft < 60 && (
                    <span className="text-xs text-red-600 font-medium animate-pulse">Sắp hết hạn!</span>
                  )}
                </div>

                {/* Instructions with gradient */}
                <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-3 w-full max-w-md shadow-lg">
                  <h4 className="font-bold text-blue-900 mb-3 flex items-center text-sm">
                    <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center mr-2">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    Hướng dẫn đăng nhập
                  </h4>
                  <ol className="space-y-2">
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full mr-2 flex-shrink-0 mt-0.5">1</span>
                      <span className="text-gray-700 text-sm">Mở ứng dụng <span className="font-semibold text-blue-900">Ainnect</span> trên điện thoại</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full mr-2 flex-shrink-0 mt-0.5">2</span>
                      <span className="text-gray-700 text-sm">Chạm vào biểu tượng <span className="font-semibold text-blue-900">quét QR</span></span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full mr-2 flex-shrink-0 mt-0.5">3</span>
                      <span className="text-gray-700 text-sm">Quét mã QR này để <span className="font-semibold text-blue-900">đăng nhập ngay</span></span>
                    </li>
                  </ol>
                </div>

                {/* Loading indicator with animation */}
                <div className="flex items-center space-x-2 text-sm bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
                  <div className="relative flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-blue-700 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-blue-800 font-medium">Đang chờ quét mã...</span>
                </div>
              </>
            )}

            {/* Expired/Cancelled Actions */}
            {(status === 'EXPIRED' || status === 'CANCELLED') && (
              <div className="mt-4 space-y-3">
                <div className="bg-gray-50 rounded-xl p-4 text-center max-w-md mx-auto">
                  <p className="text-gray-600 text-sm">
                    {status === 'EXPIRED' 
                      ? 'Mã QR đã hết hạn sau 10 phút. Vui lòng tạo mã mới để tiếp tục.'
                      : 'Bạn đã hủy đăng nhập từ thiết bị di động.'}
                  </p>
                </div>
                <Button 
                  onClick={handleRefresh} 
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Tạo mã QR mới
                </Button>
              </div>
            )}

            {/* Confirmed Success */}
            {status === 'CONFIRMED' && (
              <div className="mt-4">
                <div className="relative">
                  {/* Success animation circles */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full animate-ping opacity-75"></div>
                  </div>
                  <div className="relative flex items-center justify-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-gray-600 font-medium animate-pulse text-sm">Đang chuyển hướng đến trang chủ...</p>
              </div>
            )}
          </div>
        ) : null}

        {/* Alternative login method */}
        {status === 'PENDING' && qrSession && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">Không có ứng dụng di động?</p>
              <button
                onClick={onClose}
                className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Đăng nhập bằng mật khẩu
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

