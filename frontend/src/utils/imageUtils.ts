import { debugLogger } from './debugLogger';

/**
 * Download an image from a URL and convert it to a File object
 * @param imageUrl - The URL of the image to download
 * @param defaultFilename - Default filename if unable to extract from URL
 * @returns File object or URL string as fallback
 */
export async function downloadImageFromUrl(
  imageUrl: string,
  defaultFilename: string = 'image.jpg'
): Promise<File | string> {
  try {
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    
    // Extract filename from URL or use default
    const filename = imageUrl.split('/').pop()?.split('?')[0] || defaultFilename;
    
    // Create File object from blob
    const file = new File([blob], filename, { type: blob.type || 'image/jpeg' });
    
    debugLogger.log('ImageUtils', 'Successfully downloaded image from URL', {
      url: imageUrl,
      filename: file.name,
      size: file.size,
      type: file.type
    });
    
    return file;
  } catch (error) {
    debugLogger.log('ImageUtils', 'Failed to download image from URL', {
      url: imageUrl,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    // Return URL as fallback
    return imageUrl;
  }
}

/**
 * Convert a File or Blob to a data URL for preview
 * @param fileOrBlob - File or Blob to convert
 * @returns Promise that resolves to data URL string
 */
export function fileToDataUrl(fileOrBlob: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('FileReader error'));
    };
    
    reader.readAsDataURL(fileOrBlob);
  });
}

/**
 * Validate if a file is a valid image
 * @param file - File to validate
 * @param maxSizeMB - Maximum size in MB (default: 5MB)
 * @returns Object with isValid flag and error message if invalid
 */
export function validateImageFile(
  file: File,
  maxSizeMB: number = 5
): { isValid: boolean; error?: string } {
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Định dạng file không hợp lệ. Chỉ chấp nhận JPG, PNG, GIF, WEBP'
    };
  }
  
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `Kích thước file vượt quá ${maxSizeMB}MB`
    };
  }
  
  return { isValid: true };
}

/**
 * Compress an image file to reduce size
 * @param file - Image file to compress
 * @param maxWidth - Maximum width in pixels
 * @param maxHeight - Maximum height in pixels
 * @param quality - JPEG quality (0-1)
 * @returns Promise that resolves to compressed File
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.85
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        
        // Calculate new dimensions
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }
            
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            
            debugLogger.log('ImageUtils', 'Image compressed successfully', {
              originalSize: file.size,
              compressedSize: compressedFile.size,
              reduction: `${(((file.size - compressedFile.size) / file.size) * 100).toFixed(1)}%`
            });
            
            resolve(compressedFile);
          },
          file.type,
          quality
        );
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}
