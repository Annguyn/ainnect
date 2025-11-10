import React, { useState, useEffect } from 'react';
import { Download, Smartphone, CheckCircle, Star, Users, MessageCircle, Shield, Zap, ChevronDown, ChevronUp, Calendar, Package } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { apkVersionService, ApkVersion } from '../services/apkVersionService';

const DownloadPage: React.FC = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [apkUrl, setApkUrl] = useState('https://cdn.ainnect.me/apk/app-release.apk');
  const [versionInfo, setVersionInfo] = useState<{
    versionName: string;
    fileSize: number;
    description: string;
    releaseDate: string;
    versionCode: number;
  } | null>(null);
  const [showChangelog, setShowChangelog] = useState(false);

  useEffect(() => {
    const loadActiveVersion = async () => {
      try {
        const activeVersion = await apkVersionService.getActiveVersion();
        setApkUrl(activeVersion.apkUrl);
        setVersionInfo({
          versionName: activeVersion.versionName,
          fileSize: activeVersion.fileSize,
          description: activeVersion.description,
          releaseDate: activeVersion.releaseDate,
          versionCode: activeVersion.versionCode
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

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const parseChangelog = (description: string) => {
    // Parse description to extract changelog items
    const lines = description.split('\n').filter(line => line.trim());
    const items: { category: string; items: string[] }[] = [];
    let currentCategory = '';
    let currentItems: string[] = [];

    lines.forEach(line => {
      const trimmed = line.trim();
      // Check if it's a category header (e.g., "New Features:", "Bug Fixes:")
      if (trimmed.endsWith(':') && !trimmed.startsWith('-') && !trimmed.startsWith('•')) {
        if (currentCategory && currentItems.length > 0) {
          items.push({ category: currentCategory, items: [...currentItems] });
          currentItems = [];
        }
        currentCategory = trimmed.slice(0, -1);
      } else if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
        // It's a list item
        currentItems.push(trimmed.substring(1).trim());
      } else if (trimmed && currentCategory) {
        // Regular text under a category
        currentItems.push(trimmed);
      }
    });

    // Add last category
    if (currentCategory && currentItems.length > 0) {
      items.push({ category: currentCategory, items: currentItems });
    }

    // If no structured changelog, return description as single item
    if (items.length === 0 && description.trim()) {
      return [{ category: 'Thông tin phiên bản', items: [description.trim()] }];
    }

    return items;
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

      {/* Version Info & Changelog Section */}
      {versionInfo && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Package className="w-6 h-6" />
                    <h3 className="text-2xl font-bold">Phiên bản {versionInfo.versionName}</h3>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-blue-100">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(versionInfo.releaseDate)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Download className="w-4 h-4" />
                      <span>{formatFileSize(versionInfo.fileSize)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="font-mono">Build {versionInfo.versionCode}</span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => setShowChangelog(!showChangelog)}
                  className="!bg-white/20 hover:!bg-white/30 !text-white border-2 border-white/50"
                >
                  {showChangelog ? (
                    <>
                      <ChevronUp className="w-5 h-5 mr-2" />
                      Ẩn chi tiết
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-5 h-5 mr-2" />
                      Xem chi tiết
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Changelog Content */}
            {showChangelog && (
              <div className="p-6 bg-gray-50 border-t-4 border-blue-500 animate-fadeIn">
                <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  Ghi chú phát hành
                </h4>

                {parseChangelog(versionInfo.description).map((section, idx) => (
                  <div key={idx} className="mb-6 last:mb-0">
                    <h5 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      {section.category}
                    </h5>
                    <ul className="space-y-2 ml-4">
                      {section.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-start text-gray-700">
                          <CheckCircle className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="w-full sm:w-auto !bg-gradient-to-r !from-blue-600 !to-blue-500 hover:!from-blue-700 hover:!to-blue-600"
                    size="lg"
                  >
                    <Download className={`w-5 h-5 mr-2 ${isDownloading ? 'animate-bounce' : ''}`} />
                    {isDownloading ? 'Đang tải xuống...' : 'Tải xuống phiên bản này'}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

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
