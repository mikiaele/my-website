export type Language = 'en' | 'am' | 'ti';

export interface Product {
  id: string;
  titleEn: string;
  titleAm: string;
  titleTi: string;
  category: string;
  categoryAm: string;
  categoryTi: string;
  price: number;
  originalPrice?: number;
  location: string;
  locationAm: string;
  locationTi: string;
  condition: 'Brand New' | 'Like New' | 'Gently Used';
  conditionAm: string;
  conditionTi: string;
  sellerName: string;
  sellerPhone: string;
  isVerified: boolean;
  rating: number;
  reviewsCount: number;
  descriptionEn: string;
  descriptionAm: string;
  descriptionTi: string;
  featuresEn: string[];
  featuresAm: string[];
  featuresTi: string[];
  inStock: boolean;
  dateListed: string;
  imageUrl: string;
  iconName: string;
}

export interface Category {
  id: string;
  nameEn: string;
  nameAm: string;
  nameTi: string;
  icon: string;
  count: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: 'user' | 'seller' | 'admin';
}
