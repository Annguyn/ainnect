export const isVideoUrl = (url: string): boolean => {
  if (!url) return false;
  
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.m4v'];
  const lowerUrl = url.toLowerCase();
  
  return videoExtensions.some(ext => lowerUrl.includes(ext));
};

export const isImageUrl = (url: string): boolean => {
  if (!url) return false;
  
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
  const lowerUrl = url.toLowerCase();
  
  return imageExtensions.some(ext => lowerUrl.includes(ext));
};

export const getMediaType = (url: string): 'image' | 'video' | 'unknown' => {
  if (isVideoUrl(url)) return 'video';
  if (isImageUrl(url)) return 'image';
  return 'unknown';
};

