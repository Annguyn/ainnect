import React from 'react';

interface ConnectionAnimationProps {
  className?: string;
  variant?: 'login' | 'register';
}

export const ConnectionAnimation: React.FC<ConnectionAnimationProps> = ({ 
  className = '', 
  variant = 'login' 
}) => {

  return (
    <div className={`relative w-full h-full flex flex-col items-center justify-center p-8 ${className}`}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"></div>
      
      {/* Subtle decorative circles */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-purple-200 rounded-full opacity-20 blur-3xl"></div>

      {/* Main content */}
      <div className="relative z-10 text-center w-full max-w-4xl">
        {/* Title */}
        <div className="mb-8">
          <h2 className="text-5xl font-bold text-gray-800 mb-4">
            {variant === 'login' ? 'Chào mừng trở lại!' : 'Tham gia Ainnect!'}
          </h2>
          <p className="text-gray-600 text-2xl">
            {variant === 'login' ? 'Kết nối với bạn bè mọi lúc, mọi nơi' : 'Trải nghiệm mạng xã hội thế hệ mới'}
          </p>
        </div>

        {/* Mobile App Preview - HIGHLIGHTED */}
        <div className="relative flex justify-center items-center gap-8 mb-16 min-h-[600px]">
          {/* Glow effect behind phones */}
          <div className="absolute inset-0 bg-gradient-to-t from-blue-400/40 to-transparent blur-3xl"></div>
          
          {/* Phone 1 - Left */}
          <div className="transform hover:scale-105 transition-all duration-500 hover:-translate-y-4">
            <div className="relative w-52 h-[450px] bg-gradient-to-br from-gray-900 to-gray-800 rounded-[3rem] p-3 shadow-2xl ring-4 ring-white/10">
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-20 h-5 bg-gray-900 rounded-full"></div>
              <div className="absolute inset-3 bg-white rounded-[2.5rem] overflow-hidden">
                <img
                  src="/img_mobile_1.png"
                  alt="Ainnect App - Feed"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              {/* Screen shine effect */}
              <div className="absolute inset-3 bg-gradient-to-tr from-transparent via-white/5 to-transparent rounded-[2.5rem] pointer-events-none"></div>
            </div>
          </div>

          {/* Phone 2 - Center (MAIN FOCUS - Larger) */}
          <div className="transform scale-110 hover:scale-[1.18] transition-all duration-500 z-20 hover:-translate-y-6">
            <div className="relative w-56 h-[480px] bg-gradient-to-br from-gray-900 to-gray-800 rounded-[3rem] p-3 shadow-[0_30px_100px_rgba(0,0,0,0.5)] ring-4 ring-blue-500/40">
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-20 h-5 bg-gray-900 rounded-full"></div>
              <div className="absolute inset-3 bg-white rounded-[2.5rem] overflow-hidden ring-2 ring-blue-500/30">
                <img
                  src="/img_mobile_2.png"
                  alt="Ainnect App - Main"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              {/* Screen shine effect */}
              <div className="absolute inset-3 bg-gradient-to-tr from-transparent via-white/10 to-transparent rounded-[2.5rem] pointer-events-none"></div>
              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-xl animate-pulse">
                NEW
              </div>
            </div>
          </div>

          {/* Phone 3 - Right */}
          <div className="transform hover:scale-105 transition-all duration-500 hover:-translate-y-4">
            <div className="relative w-52 h-[450px] bg-gradient-to-br from-gray-900 to-gray-800 rounded-[3rem] p-3 shadow-2xl ring-4 ring-white/10">
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-20 h-5 bg-gray-900 rounded-full"></div>
              <div className="absolute inset-3 bg-white rounded-[2.5rem] overflow-hidden">
                <img
                  src="/img_mobile_3.png"
                  alt="Ainnect App - Chat"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              {/* Screen shine effect */}
              <div className="absolute inset-3 bg-gradient-to-tr from-transparent via-white/5 to-transparent rounded-[2.5rem] pointer-events-none"></div>
            </div>
          </div>
        </div>

        {/* Download CTA */}
        <div className="mb-12">
          <div className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-5 rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 cursor-pointer">
            <svg className="w-8 h-8 mr-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85a.637.637 0 0 0-.83.22l-1.88 3.24a11.43 11.43 0 0 0-8.94 0L5.65 5.67a.643.643 0 0 0-.87-.2c-.28.18-.37.54-.22.83L6.4 9.48A10.81 10.81 0 0 0 1 18h22a10.81 10.81 0 0 0-5.4-8.52zM7 15.25a1.25 1.25 0 1 1 2.5 0 1.25 1.25 0 0 1-2.5 0zm7.5 0a1.25 1.25 0 1 1 2.5 0 1.25 1.25 0 0 1-2.5 0z"/>
            </svg>
            <div className="text-left">
              <div className="font-bold text-xl">Tải ứng dụng Android</div>
              <div className="text-base text-blue-100">Miễn phí • 4.8★ • 10K+ tải xuống</div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-800 text-lg mb-2">Nhắn tin</h3>
            <p className="text-sm text-gray-600">Nhanh chóng</p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-800 text-lg mb-2">Cộng đồng</h3>
            <p className="text-sm text-gray-600">Kết nối</p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-800 text-lg mb-2">Bảo mật</h3>
            <p className="text-sm text-gray-600">An toàn</p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-800 text-lg mb-2">Hiệu suất</h3>
            <p className="text-sm text-gray-600">Mượt mà</p>
          </div>
        </div>
      </div>
    </div>
  );
};
