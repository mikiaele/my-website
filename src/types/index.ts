export type Language = 'am' | 'en' | 'ti';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  profilePhoto: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Product {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  condition: 'new' | 'used';
  price: number;
  currency: string;
  photoUrl: string;
  region: string;
  district: string;
  city: string;
  sellerContact: string;
  sellerName?: string;
  sellerPhoto?: string;
  status: 'active' | 'sold' | 'hidden';
  createdAt: string;
}

export interface Inquiry {
  id: string;
  productId: string;
  productTitle?: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  message: string;
  status: 'pending' | 'responded' | 'closed';
  createdAt: string;
}

export interface Report {
  id: string;
  productId: string;
  productTitle?: string;
  reporterEmail: string;
  reason: string;
  status: 'pending' | 'reviewed';
  createdAt: string;
}

export interface DatabaseStatus {
  connected: boolean;
  engine: string;
  message: string;
  tablesVerified: boolean;
  latencyMs?: number;
  tableCounts?: {
    users: number;
    products: number;
    inquiries: number;
    reports: number;
  };
  neonConfigured: boolean;
}
