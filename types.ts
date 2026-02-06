
export enum ProductStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  HIDDEN = 'hidden'
}

export enum BadgeType {
  TOP = 'TOP',
  CUPOM = 'CUPOM',
  OFERTA = 'OFERTA',
  RELAMPAGO = 'RELAMPAGO'
}

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed'
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountValue: number;
  discountType: DiscountType;
  expiryDate: string;
  status: 'active' | 'expired' | 'inactive';
}

export interface Product {
  id: string;
  code: string; // SKU de 5 dígitos
  title: string;
  description: string;
  category: string;
  price: number;
  oldPrice?: number;
  link: string;
  images: string[];
  status: ProductStatus;
  badges: BadgeType[];
  isFeatured: boolean;
  isHighlighted: boolean; // Para o banner carrossel
  isDailyOffer: boolean;
  isLightningDeal: boolean;
  expirationDate?: string;
  createdAt: string;
  clickCount: number;
  couponId?: string;
}

export interface Category {
  id: string;
  name: string;
  productCount: number;
}

export interface ClickAnalytic {
  id: string;
  productId: string;
  origin: string;
  timestamp: string;
}

export interface AdminUser {
  id: string;
  username: string;
  passwordHash: string;
}

export interface AppStats {
  totalClicks: number;
  activeProducts: number;
  pausedProducts: number;
  clicksByOrigin: Record<string, number>;
  mostClickedProducts: Product[];
}
