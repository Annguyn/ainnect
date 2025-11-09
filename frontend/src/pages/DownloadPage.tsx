import React, { useState, useEffect } from 'react';
import { Download, Smartphone, CheckCircle, Star, Users, MessageCircle, Shield, Zap } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { apkVersionService } from '../services/apkVersionService';

const DownloadPage: React.FC = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [apkUrl, setApkUrl] = useState('https://cdn.ainnect.me/apk/app-release.apk');
  const [versionInfo, setVersionInfo] = useState<{
    versionName: string;
    fileSize: number;
    description: string;
  } | null>(null);

  useEffect(() => {
    const loadActiveVersion = async () => {
      try {
        const activeVersion = await apkVersionService.getActiveVersion();
        setApkUrl(activeVersion.apkUrl);
        setVersionInfo({
          versionName: activeVersion.versionName,
          fileSize: activeVersion.fileSize,
          description: activeVersion.description
        });
      } catch (err) {
        console.error('Failed to load active APK version:', err);
        // Keep default URL if API fails
      }
    };

    loadActiveVersion();
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleDownload = () => {
    setIsDownloading(true);
    const link = document.createElement('a');
    link.href = apkUrl;
    link.download = `ainnect-${versionInfo?.versionName || 'app'}.apk`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setIsDownloading(false);
    }, 2000);
  };

  const features = [
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: 'Nhắn tin nhanh chóng',
      description: 'Trò chuyện với bạn bè một cách mượt mà và tiện lợi'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Kết nối cộng đồng',
      description: 'Tham gia các nhóm và mở rộng mạng lưới quan hệ'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Bảo mật cao',
      description: 'Dữ liệu của bạn được mã hóa và bảo vệ tối đa'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Hiệu suất cao',
      description: 'Ứng dụng chạy mượt mà, tải nhanh, tiết kiệm pin'
    }
  ];

  const reviews = [
    {
      name: 'Nguyễn Văn A',
      rating: 5,
      comment: 'Ứng dụng tuyệt vời! Giao diện đẹp và dễ sử dụng.',
      avatar: '/default-avatar.png'
    },
    {
      name: 'Trần Thị B',
      rating: 5,
      comment: 'Kết nối với bạn bè rất nhanh chóng và tiện lợi.',
      avatar: '/default-avatar.png'
    },
    {
      name: 'Lê Văn C',
      rating: 5,
      comment: 'Tính năng nhắn tin rất tốt, không bị lag.',
      avatar: '/default-avatar.png'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-500 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <Smartphone className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">Phiên bản Android</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Tải xuống 
                <span className="block text-yellow-500">ainnect</span>
                <span className="block text-green-500">Android</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-2xl">
                Kết nối với bạn bè, chia sẻ khoảnh khắc và khám phá cộng đồng ngay trên thiết bị di động của bạn.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <Button
                  size="lg"
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="!bg-white !text-blue-600 hover:!bg-gray-100 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 text-lg px-8 py-6 font-semibold"
                >
                  <Download className={`w-6 h-6 mr-3 ${isDownloading ? 'animate-bounce' : ''}`} />
                  {isDownloading ? 'Đang tải xuống...' : 'Tải xuống APK'}
                </Button>
                
                <Button
                  size="lg"
                  variant="outline"
                  className="!border-2 !border-white !text-white hover:!bg-white/10 hover:!text-white !bg-transparent transition-all duration-200 text-lg px-8 py-6 font-semibold backdrop-blur-sm"
                  onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                >
                  Tìm hiểu thêm
                </Button>
              </div>

              <div className="flex flex-wrap gap-6 justify-center lg:justify-start text-sm">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-blue-200" />
                  <span>Miễn phí 100%</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-blue-200" />
                  <span>Không quảng cáo</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-blue-200" />
                  <span>Cập nhật thường xuyên</span>
                </div>
              </div>
            </div>

            {/* Right - Phone Screenshots */}
            <div className="relative hidden lg:block">
              <div className="relative flex justify-center items-center gap-4">
                {/* Phone 1 - Left */}
                <div className="transform -rotate-6 hover:rotate-0 transition-transform duration-300">
                  <div className="relative w-64 h-[500px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-gray-900 rounded-b-3xl"></div>
                    <img
                      src="/img_mobile_1.png"
                      alt="Ainnect App Screenshot 1"
                      className="w-full h-full object-cover rounded-[2.5rem]"
                      onError={(e) => {
                        e.currentTarget.src = '/default-avatar.png';
                      }}
                    />
                  </div>
                </div>

                {/* Phone 2 - Center (Larger) */}
                <div className="transform scale-110 hover:scale-115 transition-transform duration-300 z-10">
                  <div className="relative w-64 h-[500px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-gray-900 rounded-b-3xl"></div>
                    <img
                      src="/img_mobile_2.png"
                      alt="Ainnect App Screenshot 2"
                      className="w-full h-full object-cover rounded-[2.5rem]"
                      onError={(e) => {
                        e.currentTarget.src = '/default-avatar.png';
                      }}
                    />
                  </div>
                </div>

                {/* Phone 3 - Right */}
                <div className="transform rotate-6 hover:rotate-0 transition-transform duration-300">
                  <div className="relative w-64 h-[500px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-gray-900 rounded-b-3xl"></div>
                    <img
                      src="/img_mobile_3.png"
                      alt="Ainnect App Screenshot 3"
                      className="w-full h-full object-cover rounded-[2.5rem]"
                      onError={(e) => {
                        e.currentTarget.src = '/default-avatar.png';
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Screenshots for smaller screens */}
      <div className="lg:hidden py-12 bg-gradient-to-r from-blue-600 to-blue-500">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {['/img_mobile_1.png', '/img_mobile_2.png', '/img_mobile_3.png'].map((img, index) => (
              <div key={index} className="flex-shrink-0 snap-center">
                <div className="relative w-56 h-[450px] bg-gray-900 rounded-[2.5rem] p-3 shadow-2xl">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-5 bg-gray-900 rounded-b-2xl"></div>
                  <img
                    src={img}
                    alt={`Ainnect Screenshot ${index + 1}`}
                    className="w-full h-full object-cover rounded-[2rem]"
                    onError={(e) => {
                      e.currentTarget.src = '/default-avatar.png';
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Tại sao chọn Ainnect?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Trải nghiệm mạng xã hội hoàn toàn mới với những tính năng độc đáo
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 hover:shadow-xl transition-shadow duration-300 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl text-white mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold mb-2">10K+</div>
              <div className="text-blue-100">Người dùng</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold mb-2">50K+</div>
              <div className="text-blue-100">Bài viết</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold mb-2">100K+</div>
              <div className="text-blue-100">Tin nhắn</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold mb-2">4.8★</div>
              <div className="text-blue-100">Đánh giá</div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Người dùng nói gì về chúng tôi
          </h2>
          <p className="text-lg text-gray-600">
            Hàng nghìn đánh giá 5 sao từ người dùng hài lòng
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <Card key={index} className="p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <img
                  src={review.avatar}
                  alt={review.name}
                  className="w-12 h-12 rounded-full mr-3"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{review.name}</h4>
                  <div className="flex text-yellow-400">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 italic">"{review.comment}"</p>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Sẵn sàng trải nghiệm?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Tải xuống ngay và bắt đầu kết nối với cộng đồng Ainnect
          </p>
          <Button
            size="lg"
            onClick={handleDownload}
            disabled={isDownloading}
            className="!bg-white !text-blue-600 hover:!bg-gray-100 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 text-lg px-10 py-6 font-semibold"
          >
            <Download className={`w-6 h-6 mr-3 ${isDownloading ? 'animate-bounce' : ''}`} />
            {isDownloading ? 'Đang tải xuống...' : 'Tải xuống miễn phí'}
          </Button>
          
          <p className="text-sm text-blue-100 mt-6">
            Tệp APK • 
            {versionInfo ? (
              <>
                Version {versionInfo.versionName} • 
                Kích thước: {formatFileSize(versionInfo.fileSize)}
              </>
            ) : (
              <>Kích thước: ~15MB</>
            )}
            {' '}• Yêu cầu Android 5.0 trở lên
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>© 2025 Ainnect. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </div>
  );
};

export default DownloadPage;
