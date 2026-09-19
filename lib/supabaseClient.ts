/* ==========================================================================
   Moscú Showroom - Supabase Client & Resilient Hybrid Data Access Layer
   ========================================================================== */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Product,
  Category,
  HeroSlide,
  Order,
  StoreSettings
} from './types';
import {
  INITIAL_CATEGORIES,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_HERO_SLIDES,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_SETTINGS
} from '../js/data.js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-project-id')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const STORAGE_KEYS = {
  PRODUCTS: 'moscu_store_products',
  CATEGORIES: 'moscu_store_categories',
  SLIDES: 'moscu_store_slides',
  ANNOUNCEMENTS: 'moscu_store_announcements',
  ORDERS: 'moscu_store_orders',
  SETTINGS: 'moscu_store_settings',
  CART: 'moscu_store_cart'
};

// Helper to get local data with fallback
function getLocalItem<T>(key: string, defaultVal: T): T {
  if (typeof window === 'undefined') return defaultVal;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setLocalItem<T>(key: string, val: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
    window.dispatchEvent(new CustomEvent('mitienda_store_change', { detail: { key } }));
    window.dispatchEvent(new CustomEvent('tutienda_store_change', { detail: { key } }));
    window.dispatchEvent(new CustomEvent('moscu_store_change', { detail: { key } }));
  } catch (err) {
    console.error('Error saving to localStorage:', err);
  }
}

// Ensure initial seed data exists locally
export function ensureInitialData(): void {
  if (typeof window === 'undefined') return;
  const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (!storedSettings || storedSettings.includes('Moscú') || storedSettings.includes('TuTienda')) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SLIDES)) {
    localStorage.setItem(STORAGE_KEYS.SLIDES, JSON.stringify(INITIAL_HERO_SLIDES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS)) {
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(INITIAL_ANNOUNCEMENTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
  }
}

// ============================================================================
// DATA ACCESS FUNCTIONS (Supabase with automatic Fallback)
// ============================================================================

// 1. PRODUCTS
export async function getProducts(): Promise<Product[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_sizes(*)');
      if (!error && data && data.length > 0) {
        return data.map(p => ({
          ...p,
          sizes: p.product_sizes || []
        }));
      }
    } catch (err) {
      console.warn('Supabase fetch failed, using local storage fallback:', err);
    }
  }
  return getLocalItem<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS as Product[]);
}

export async function getProductById(id: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find(p => p.id === id) || null;
}

export async function saveProduct(productData: Partial<Product>): Promise<Product> {
  const products = await getProducts();
  let savedProduct: Product;

  if (productData.id) {
    // Update existing
    const idx = products.findIndex(p => p.id === productData.id);
    if (idx > -1) {
      products[idx] = { ...products[idx], ...productData } as Product;
      savedProduct = products[idx];
    } else {
      savedProduct = productData as Product;
      products.unshift(savedProduct);
    }
  } else {
    // Create new
    savedProduct = {
      id: 'prod-' + Date.now(),
      sku: productData.sku || 'MSC-' + Math.floor(1000 + Math.random() * 9000),
      name: productData.name || 'Nueva Prenda',
      category: productData.category || 'todos',
      categoryName: productData.categoryName || 'Indumentaria',
      price: Number(productData.price) || 0,
      comparePrice: productData.comparePrice ? Number(productData.comparePrice) : null,
      transferDiscountPct: Number(productData.transferDiscountPct) || 15,
      tags: productData.tags || [],
      isFeatured: Boolean(productData.isFeatured),
      isNew: Boolean(productData.isNew),
      isSale: Boolean(productData.isSale),
      description: productData.description || '',
      specs: productData.specs || {
        composicion: '100% Algodón Premium',
        corte: 'Calce Oversize Boxy',
        cuidados: 'Lavar con agua fría.'
      },
      images: productData.images && productData.images.length ? productData.images : [
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop'
      ],
      sizes: productData.sizes || [
        { size: 'S', stock: 5 },
        { size: 'M', stock: 8 },
        { size: 'L', stock: 6 }
      ]
    };
    products.unshift(savedProduct);
  }

  // Save to Supabase if configured
  if (supabase) {
    try {
      await supabase.from('products').upsert({
        id: savedProduct.id,
        sku: savedProduct.sku,
        name: savedProduct.name,
        category: savedProduct.category,
        category_name: savedProduct.categoryName,
        price: savedProduct.price,
        compare_price: savedProduct.comparePrice,
        transfer_discount_pct: savedProduct.transferDiscountPct,
        tags: savedProduct.tags,
        description: savedProduct.description,
        specs: savedProduct.specs,
        images: savedProduct.images
      });

      if (savedProduct.sizes && savedProduct.sizes.length) {
        await supabase.from('product_sizes').delete().eq('product_id', savedProduct.id);
        await supabase.from('product_sizes').insert(
          savedProduct.sizes.map(s => ({
            product_id: savedProduct.id,
            size: s.size,
            stock: s.stock
          }))
        );
      }
    } catch (err) {
      console.warn('Supabase upsert failed, continuing with local storage:', err);
    }
  }

  setLocalItem(STORAGE_KEYS.PRODUCTS, products);
  return savedProduct;
}

export async function deleteProduct(id: string): Promise<void> {
  let products = await getProducts();
  products = products.filter(p => p.id !== id);
  setLocalItem(STORAGE_KEYS.PRODUCTS, products);

  if (supabase) {
    try {
      await supabase.from('products').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase delete failed:', err);
    }
  }
}

// 2. CATEGORIES
export async function getCategories(): Promise<Category[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('categories').select('*');
      if (!error && data && data.length > 0) return data as Category[];
    } catch (err) {
      console.warn('Supabase categories error:', err);
    }
  }
  return getLocalItem<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES as Category[]);
}

export async function saveCategory(category: Partial<Category>): Promise<Category> {
  const categories = await getCategories();
  const newCat: Category = {
    id: category.slug || 'cat-' + Date.now(),
    name: (category.name || '').toUpperCase(),
    slug: category.slug || (category.name || '').toLowerCase().replace(/\s+/g, '-'),
    count: category.count || 0,
    showInNav: category.showInNav !== false,
    badge: category.badge || ''
  };

  const idx = categories.findIndex(c => c.slug === newCat.slug);
  if (idx > -1) {
    categories[idx] = newCat;
  } else {
    categories.push(newCat);
  }

  if (supabase) {
    try {
      await supabase.from('categories').upsert(newCat);
    } catch (err) {
      console.warn('Supabase category upsert error:', err);
    }
  }

  setLocalItem(STORAGE_KEYS.CATEGORIES, categories);
  return newCat;
}

export async function deleteCategory(id: string): Promise<void> {
  let categories = await getCategories();
  categories = categories.filter(c => c.id !== id && c.slug !== id);
  setLocalItem(STORAGE_KEYS.CATEGORIES, categories);

  if (supabase) {
    try {
      await supabase.from('categories').delete().or(`id.eq.${id},slug.eq.${id}`);
    } catch (err) {
      console.warn('Supabase delete category error:', err);
    }
  }
}

// 3. HERO SLIDES & ANNOUNCEMENTS
export async function getHeroSlides(): Promise<HeroSlide[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('hero_slides').select('*').order('sort_order');
      if (!error && data && data.length > 0) return data as HeroSlide[];
    } catch (err) {
      console.warn('Supabase slides error:', err);
    }
  }
  return getLocalItem<HeroSlide[]>(STORAGE_KEYS.SLIDES, INITIAL_HERO_SLIDES as HeroSlide[]);
}

export async function saveHeroSlides(slides: HeroSlide[]): Promise<void> {
  setLocalItem(STORAGE_KEYS.SLIDES, slides);
  if (supabase) {
    try {
      await supabase.from('hero_slides').delete().neq('id', 'null');
      await supabase.from('hero_slides').insert(slides);
    } catch (err) {
      console.warn('Supabase save slides error:', err);
    }
  }
}

export async function getAnnouncements(): Promise<string[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('announcements').select('message');
      if (!error && data && data.length > 0) return data.map(d => d.message);
    } catch (err) {
      console.warn('Supabase announcements error:', err);
    }
  }
  return getLocalItem<string[]>(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
}

export async function saveAnnouncements(messages: string[]): Promise<void> {
  setLocalItem(STORAGE_KEYS.ANNOUNCEMENTS, messages);
}

// 4. ORDERS
export async function getOrders(): Promise<Order[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('orders').select('*').order('date', { ascending: false });
      if (!error && data && data.length > 0) return data as Order[];
    } catch (err) {
      console.warn('Supabase orders error:', err);
    }
  }
  return getLocalItem<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS as unknown as Order[]);
}

export async function createOrder(orderData: Partial<Order>): Promise<Order> {
  const orders = await getOrders();
  const newOrder: Order = {
    id: 'MSC-' + Math.floor(10000 + Math.random() * 90000),
    date: new Date().toISOString(),
    customer: orderData.customer!,
    items: orderData.items!,
    shipping: orderData.shipping!,
    payment: orderData.payment!,
    subtotal: orderData.subtotal || 0,
    total: orderData.total || 0,
    status: 'Pendiente',
    trackingCode: ''
  };

  orders.unshift(newOrder);
  setLocalItem(STORAGE_KEYS.ORDERS, orders);

  if (supabase) {
    try {
      await supabase.from('orders').insert(newOrder);
    } catch (err) {
      console.warn('Supabase insert order error:', err);
    }
  }

  // Deduct stock locally
  const products = await getProducts();
  for (const item of newOrder.items) {
    const p = products.find(prod => prod.id === item.productId);
    if (p && p.sizes) {
      const sizeObj = p.sizes.find(s => s.size === item.size);
      if (sizeObj && sizeObj.stock >= item.quantity) {
        sizeObj.stock -= item.quantity;
      }
    }
  }
  setLocalItem(STORAGE_KEYS.PRODUCTS, products);

  return newOrder;
}

export async function updateOrderStatus(orderId: string, status: Order['status'], trackingCode?: string): Promise<Order | null> {
  const orders = await getOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) return null;

  order.status = status;
  if (trackingCode !== undefined) order.trackingCode = trackingCode;

  setLocalItem(STORAGE_KEYS.ORDERS, orders);

  if (supabase) {
    try {
      await supabase.from('orders').update({ status, tracking_code: order.trackingCode }).eq('id', orderId);
    } catch (err) {
      console.warn('Supabase update order error:', err);
    }
  }

  return order;
}

// 5. SETTINGS
export async function getStoreSettings(): Promise<StoreSettings> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('store_settings').select('*').single();
      if (!error && data) return data as StoreSettings;
    } catch (err) {
      console.warn('Supabase settings error:', err);
    }
  }
  return getLocalItem<StoreSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS as StoreSettings);
}

export async function saveStoreSettings(settings: StoreSettings): Promise<StoreSettings> {
  setLocalItem(STORAGE_KEYS.SETTINGS, settings);
  if (supabase) {
    try {
      await supabase.from('store_settings').upsert({ id: 1, ...settings });
    } catch (err) {
      console.warn('Supabase save settings error:', err);
    }
  }
  return settings;
}

// 6. STORAGE UPLOAD (Supabase Storage with Base64 fallback)
export async function uploadProductImage(file: File): Promise<string> {
  if (supabase) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (!error) {
        const { data } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);
        return data.publicUrl;
      }
    } catch (err) {
      console.warn('Supabase storage upload failed, falling back to data URL:', err);
    }
  }

  // Fallback: Convert to Base64 data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 7. RESET SEED DATA
export function resetLocalSeedData(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
  localStorage.setItem(STORAGE_KEYS.SLIDES, JSON.stringify(INITIAL_HERO_SLIDES));
  localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(INITIAL_ANNOUNCEMENTS));
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
  window.dispatchEvent(new CustomEvent('tutienda_store_change', { detail: { key: 'all' } }));
  window.dispatchEvent(new CustomEvent('moscu_store_change', { detail: { key: 'all' } }));
}

// Convenient Alias Exports
export const getSettings = getStoreSettings;
export const saveSettings = saveStoreSettings;
export const uploadImage = uploadProductImage;
export const resetToSeedData = resetLocalSeedData;
