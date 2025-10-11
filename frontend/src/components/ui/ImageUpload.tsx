import React, { useState } from 'react';
import { Input } from './Input';
import { Button } from './Button';

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  accept?: string;
  id?: string;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value = '',
  onChange,
  placeholder = "Nhập URL hình ảnh hoặc tải lên file",
  accept = "image/*",
  id = 'image-upload',
  className = ''
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      // Create a preview URL for immediate display
      const previewUrl = URL.createObjectURL(file);
      onChange(previewUrl);
      
      // Here you would typically upload the file to your server
      // For now, we'll just use the preview URL
      console.log('File selected:', file);
      
      // TODO: Implement actual file upload to server
      // const uploadedUrl = await uploadFile(file);
      // onChange(uploadedUrl);
      
    } catch (error) {
      console.error('Error handling file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    if (value && value.startsWith('blob:')) {
      URL.revokeObjectURL(value);
    }
    onChange('');
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <Input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      
      <div className="flex items-center space-x-4">
        <input
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          id={id}
          disabled={isUploading}
        />
        <label
          htmlFor={id}
          className={`px-4 py-2 rounded-md cursor-pointer transition-colors text-sm ${
            isUploading 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          {isUploading ? '⏳ Đang tải...' : '📁 Chọn file'}
        </label>
        
        {value && (
          <div className="flex items-center space-x-2">
            <img
              src={value}
              alt="Preview"
              className="w-16 h-16 object-cover rounded-md border"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemoveImage}
              className="text-red-500 hover:text-red-700 border-red-200 hover:border-red-300"
            >
              ✕ Xóa
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
