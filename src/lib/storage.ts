import { supabase, isSupabaseConfigured } from './supabase';

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface UploadResult {
  url: string;
  path: string;
  storageProvider: 'supabase' | 'server' | 'blob';
  error?: string;
}

/**
 * Validates the uploaded file type and size according to strict specifications
 */
export function validateProductPhoto(file: File, lang: 'en' | 'am' = 'en'): ValidationResult {
  if (!file) {
    return {
      isValid: false,
      error: lang === 'am' ? 'እባክዎ የምርት ፎቶ ይምረጡ።' : 'Please select a product photo to upload.',
    };
  }

  // Check file type
  const isValidType = ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase()) || 
    /\.(jpe?g|png|webp)$/i.test(file.name);

  if (!isValidType) {
    return {
      isValid: false,
      error: lang === 'am' 
        ? 'የማይፈቀድ የፎቶ አይነት። የሚፈቀዱት JPG, JPEG, PNG, እና WEBP ብቻ ናቸው።' 
        : 'Invalid file type. Only JPG, JPEG, PNG, and WEBP images are allowed.',
    };
  }

  // Check file size (max 5MB)
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: lang === 'am'
        ? 'የፎቶው መጠን ከ 5MB መብለጥ የለበትም።'
        : 'Image size exceeds the 5MB limit. Please upload a smaller file.',
    };
  }

  return { isValid: true };
}

/**
 * Uploads product photo to Supabase Storage bucket 'product-images'
 */
export async function uploadProductPhoto(
  file: File,
  lang: 'en' | 'am' = 'en'
): Promise<UploadResult> {
  const validation = validateProductPhoto(file, lang);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // Clean filename and create unique path
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const filePath = `products/${uniqueId}-${sanitizedName}`;

  // If Supabase is configured, upload directly to Supabase Storage bucket 'product-images'
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type || 'image/jpeg',
        });

      if (error) {
        console.warn('Supabase Storage bucket upload returned error:', error.message);
        // Fall back to server upload route or local blob reader
      } else if (data) {
        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(data.path);

        return {
          url: publicUrlData.publicUrl,
          path: data.path,
          storageProvider: 'supabase',
        };
      }
    } catch (err: unknown) {
      console.warn('Supabase storage upload attempt error:', err);
    }
  }

  // Attempt upload via server API if full-stack server is running
  try {
    const formData = new FormData();
    formData.append('photo', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      if (data.url) {
        return {
          url: data.url,
          path: data.path || filePath,
          storageProvider: data.storageProvider || 'server',
        };
      }
    }
  } catch (err) {
    console.warn('Server upload fallback attempt error:', err);
  }

  // Safe client-side Data URL conversion so user's actual selected photo is preserved and displayed
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        url: reader.result as string,
        path: filePath,
        storageProvider: 'blob',
      });
    };
    reader.onerror = () => {
      reject(new Error(lang === 'am' ? 'ፎቶውን ማንበብ አልተቻለም።' : 'Failed to read image file.'));
    };
    reader.readAsDataURL(file);
  });
}
