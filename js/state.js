/* ==========================================================================
   Moscú Showroom - Reactive State & LocalStorage Manager
   ========================================================================== */

import {
  INITIAL_CATEGORIES,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_HERO_SLIDES,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_SETTINGS
} from './data.js';

const STORAGE_KEYS = {
  PRODUCTS: 'moscu_store_products',
  CATEGORIES: 'moscu_store_categories',
  SLIDES: 'moscu_store_slides',
  ANNOUNCEMENTS: 'moscu_store_announcements',
  ORDERS: 'moscu_store_orders',
  SETTINGS: 'moscu_store_settings',
  CART: 'moscu_store_cart'
};

class StoreStateManager {
  constructor() {
    this.listeners = new Set();
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      this.resetToDefaults();
    }
  }

  resetToDefaults() {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    localStorage.setItem(STORAGE_KEYS.SLIDES, JSON.stringify(INITIAL_HERO_SLIDES));
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(INITIAL_ANNOUNCEMENTS));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    this.notify('all', null);
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(changeType, payload) {
    for (const listener of this.listeners) {
      try {
        listener(changeType, payload);
      } catch (err) {
        console.error('Error in state listener:', err);
      }
    }
  }

  // --- PRODUCTS CRUD ---
  getProducts() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return data ? JSON.parse(data) : [...INITIAL_PRODUCTS];
    } catch {
      return [...INITIAL_PRODUCTS];
    }
  }

  getProductById(id) {
    const products = this.getProducts();
    return products.find(p => p.id === id) || null;
  }

  addProduct(productData) {
    const products = this.getProducts();
    const newProduct = {
      id: 'prod-' + Date.now(),
      sku: productData.sku || 'MSC-' + Math.floor(1000 + Math.random() * 9000),
      name: productData.name,
      category: productData.category || 'todos',
      categoryName: productData.categoryName || 'General',
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

    products.unshift(newProduct);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    this.notify('products', { action: 'add', product: newProduct });
    return newProduct;
  }

  updateProduct(id, updatedData) {
    const products = this.getProducts();
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return null;

    products[idx] = { ...products[idx], ...updatedData };
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    this.notify('products', { action: 'update', product: products[idx] });
    return products[idx];
  }

  deleteProduct(id) {
    let products = this.getProducts();
    products = products.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    this.notify('products', { action: 'delete', id });
  }

  // --- CATEGORIES CRUD ---
  getCategories() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return data ? JSON.parse(data) : [...INITIAL_CATEGORIES];
    } catch {
      return [...INITIAL_CATEGORIES];
    }
  }

  addCategory(category) {
    const categories = this.getCategories();
    const newCat = {
      id: category.slug || 'cat-' + Date.now(),
      name: category.name.toUpperCase(),
      slug: category.slug || category.name.toLowerCase().replace(/\s+/g, '-'),
      count: 0,
      showInNav: category.showInNav !== false,
      badge: category.badge || ''
    };
    categories.push(newCat);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    this.notify('categories', { action: 'add', category: newCat });
    return newCat;
  }

  updateCategory(id, updatedData) {
    const categories = this.getCategories();
    const idx = categories.findIndex(c => c.id === id);
    if (idx === -1) return null;

    categories[idx] = { ...categories[idx], ...updatedData };
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    this.notify('categories', { action: 'update', category: categories[idx] });
    return categories[idx];
  }

  deleteCategory(id) {
    if (id === 'todos') return; // Cannot delete 'todos'
    let categories = this.getCategories();
    categories = categories.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    this.notify('categories', { action: 'delete', id });
  }

  // --- BANNERS & ANNOUNCEMENTS CMS ---
  getHeroSlides() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SLIDES);
      return data ? JSON.parse(data) : [...INITIAL_HERO_SLIDES];
    } catch {
      return [...INITIAL_HERO_SLIDES];
    }
  }

  saveHeroSlides(slides) {
    localStorage.setItem(STORAGE_KEYS.SLIDES, JSON.stringify(slides));
    this.notify('slides', slides);
  }

  getAnnouncements() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
      return data ? JSON.parse(data) : [...INITIAL_ANNOUNCEMENTS];
    } catch {
      return [...INITIAL_ANNOUNCEMENTS];
    }
  }

  saveAnnouncements(messages) {
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(messages));
    this.notify('announcements', messages);
  }

  // --- CART MANAGEMENT ---
  getCart() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CART);
      return data ? JSON.parse(data) : {
        items: [],
        coupon: null,
        note: ''
      };
    } catch {
      return { items: [], coupon: null, note: '' };
    }
  }

  saveCart(cart) {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    this.notify('cart', cart);
  }

  addToCart(product, size, quantity = 1) {
    const cart = this.getCart();
    const existingIndex = cart.items.findIndex(
      item => item.productId === product.id && item.size === size
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += quantity;
    } else {
      cart.items.push({
        id: `${product.id}-${size}`,
        productId: product.id,
        name: product.name,
        size: size,
        price: product.price,
        comparePrice: product.comparePrice,
        image: product.images[0],
        quantity: quantity
      });
    }

    this.saveCart(cart);
    return cart;
  }

  updateCartItemQty(itemId, quantity) {
    const cart = this.getCart();
    if (quantity <= 0) {
      cart.items = cart.items.filter(item => item.id !== itemId);
    } else {
      const item = cart.items.find(item => item.id === itemId);
      if (item) {
        item.quantity = quantity;
      }
    }
    this.saveCart(cart);
    return cart;
  }

  removeFromCart(itemId) {
    const cart = this.getCart();
    cart.items = cart.items.filter(item => item.id !== itemId);
    this.saveCart(cart);
    return cart;
  }

  clearCart() {
    const cart = { items: [], coupon: null, note: '' };
    this.saveCart(cart);
    return cart;
  }

  applyCoupon(code) {
    const cart = this.getCart();
    const settings = this.getSettings();
    const cleanCode = code.trim().toUpperCase();
    const match = settings.activeCoupons.find(c => c.code === cleanCode);

    if (!match) {
      return { success: false, message: 'Cupón inválido o expirado' };
    }

    const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (match.minPurchase && subtotal < match.minPurchase) {
      return {
        success: false,
        message: `El cupón requiere una compra mínima de $${match.minPurchase.toLocaleString('es-AR')}`
      };
    }

    cart.coupon = match;
    this.saveCart(cart);
    return { success: true, coupon: match };
  }

  removeCoupon() {
    const cart = this.getCart();
    cart.coupon = null;
    this.saveCart(cart);
  }

  setCartNote(note) {
    const cart = this.getCart();
    cart.note = note;
    this.saveCart(cart);
  }

  // --- ORDERS MANAGEMENT ---
  getOrders() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return data ? JSON.parse(data) : [...INITIAL_ORDERS];
    } catch {
      return [...INITIAL_ORDERS];
    }
  }

  addOrder(orderData) {
    const orders = this.getOrders();
    const newOrder = {
      id: 'MSC-' + Math.floor(10000 + Math.random() * 90000),
      date: new Date().toISOString(),
      customer: orderData.customer,
      items: orderData.items,
      shipping: orderData.shipping,
      payment: orderData.payment,
      subtotal: orderData.subtotal,
      total: orderData.total,
      status: 'Pendiente',
      trackingCode: ''
    };

    orders.unshift(newOrder);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

    // Deduct stock from products
    const products = this.getProducts();
    for (const item of newOrder.items) {
      const p = products.find(prod => prod.id === item.productId);
      if (p && p.sizes) {
        const sizeObj = p.sizes.find(s => s.size === item.size);
        if (sizeObj && sizeObj.stock >= item.quantity) {
          sizeObj.stock -= item.quantity;
        }
      }
    }
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

    this.notify('orders', { action: 'new', order: newOrder });
    this.notify('products', { action: 'stock_deducted' });
    return newOrder;
  }

  updateOrderStatus(orderId, newStatus, trackingCode = null) {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return null;

    order.status = newStatus;
    if (trackingCode !== null) {
      order.trackingCode = trackingCode;
    }

    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    this.notify('orders', { action: 'update', order });
    return order;
  }

  // --- SETTINGS ---
  getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : { ...INITIAL_SETTINGS };
    } catch {
      return { ...INITIAL_SETTINGS };
    }
  }

  updateSettings(newSettings) {
    const current = this.getSettings();
    const merged = { ...current, ...newSettings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
    this.notify('settings', merged);
    return merged;
  }
}

export const store = new StoreStateManager();
