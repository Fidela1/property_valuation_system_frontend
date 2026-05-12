const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3030';

export const getImageUrl = (url: string | undefined | null): string => {
  if (!url) {
    return '/placeholder-image.jpg';
  }
  
  // Already a full URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Remove leading slashes and normalize
  let cleanUrl = url.replace(/^\/+/, '');
  
  // If it already has uploads in path
  if (cleanUrl.startsWith('uploads/')) {
    return `${BACKEND_URL}/${cleanUrl}`;
  }
  
  // If it's just a filename or has properties folder
  if (cleanUrl.includes('properties/')) {
    return `${BACKEND_URL}/${cleanUrl}`;
  }
  
  // If it's just a filename
  if (cleanUrl.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
    return `${BACKEND_URL}/uploads/properties/${cleanUrl}`;
  }
  
  // Default fallback
  return `${BACKEND_URL}/uploads/properties/${cleanUrl}`;
};