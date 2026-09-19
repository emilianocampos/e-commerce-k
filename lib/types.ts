/* ==========================================================================
   Moscú Showroom - Shared TypeScript Type Definitions
   ========================================================================== */

export interface ProductSize {
  size: string;
  stock: number;
}

export interface ProductSpecs {
  composicion?: string;
  corte?: string;
  cuidados?: string;
}

export interface Product {
  id: string;
  sku?: string;
  name: string;
  category: string;
  categoryName: string;
  price: number;
  comparePrice?: number | null;
  transferDiscountPct?: number;
  tags: string[];
  isFeatured?: boolean;
  isNew?: boolean;
  isSale?: boolean;
  description?: string;
  specs?: ProductSpecs;
  images: string[];
  sizes: ProductSize[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  count?: number;
  showInNav?: boolean;
  badge?: string;
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle?: string;
  buttonText: string;
  categoryLink: string;
  image: string;
  imageMobile?: string;
  theme?: 'dark' | 'light';
}

export interface CartItem {
  id: string; // e.g. `${productId}-${size}`
  productId: string;
  name: string;
  size: string;
  price: number;
  comparePrice?: number | null;
  image: string;
  quantity: number;
}

export interface Coupon {
  code: string;
  discountPct: number;
  minPurchase?: number;
}

export interface CustomerAddress {
  street: string;
  number?: string;
  floor?: string;
  city: string;
  province: string;
  postalCode: string;
}

export interface Customer {
  email: string;
  name: string;
  phone: string;
  dni?: string;
  address: CustomerAddress;
}

export interface ShippingOption {
  method: 'correo' | 'andreani' | 'showroom' | 'gratis';
  name: string;
  cost: number;
}

export interface PaymentOption {
  method: 'transferencia' | 'mercadopago';
  name: string;
  discountPct: number;
  discountAmount?: number;
}

export interface Order {
  id: string;
  date: string;
  customer: Customer;
  items: CartItem[];
  shipping: ShippingOption;
  payment: PaymentOption;
  subtotal: number;
  total: number;
  status: 'Pendiente' | 'Pagado' | 'En preparación' | 'Enviado' | 'Entregado' | 'Cancelado';
  trackingCode?: string;
  mercadoPagoPreferenceId?: string;
  mercadoPagoPaymentId?: string;
  userId?: string;
}

export interface TrustBadgeItem {
  id: string;
  title: string;
  subtitle: string;
  icon: 'truck' | 'credit-card' | 'dollar' | 'map-pin';
}

export interface LookbookSettings {
  tag: string;
  title: string;
  description: string;
  buttonText: string;
  categoryLink: string;
  image: string;
}

export interface MercadoPagoSettings {
  enabled: boolean;
  publicKey: string;
  accessToken: string;
  sandboxMode: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  dni?: string;
  shippingAddress?: CustomerAddress;
  isAdmin?: boolean;
  createdAt?: string;
}

export interface StoreSettings {
  storeName: string;
  storeTagline: string;
  themeMode: 'light' | 'dark' | 'auto';
  enableGlassmorphism: boolean;
  primaryColor: string;
  adbarColor: string;
  cuotasSinInteres: number;
  transferDiscountPct: number;
  freeShippingThreshold: number;
  shippingCosts: {
    correoArgentino: number;
    andreani: number;
    showroom: number;
  };
  phoneWhatsapp: string;
  showroomAddress: string;
  bankTransferData: {
    titular: string;
    cuit: string;
    banco: string;
    cbu: string;
    alias: string;
  };
  activeCoupons: Coupon[];
  trustBadges?: TrustBadgeItem[];
  lookbook?: LookbookSettings;
  mercadoPago?: MercadoPagoSettings;
}

