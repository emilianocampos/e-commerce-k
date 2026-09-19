'use client';

/* ==========================================================================
   Moscú Showroom - Storefront Home Page (Next.js App Router)
   ========================================================================== */

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import AnnouncementBar from '../components/storefront/AnnouncementBar';
import Header from '../components/storefront/Header';
import HeroSlider from '../components/storefront/HeroSlider';
import TrustBadges from '../components/storefront/TrustBadges';
import CategoryCards from '../components/storefront/CategoryCards';
import ProductCard from '../components/storefront/ProductCard';
import ProductModal from '../components/storefront/ProductModal';
import CartDrawer from '../components/storefront/CartDrawer';
import LookbookBanner from '../components/storefront/LookbookBanner';
import Newsletter from '../components/storefront/Newsletter';
import Footer from '../components/storefront/Footer';
import MobileTabnav from '../components/storefront/MobileTabnav';
import SizeGuideModal from '../components/storefront/SizeGuideModal';
import WhatsAppButton from '../components/storefront/WhatsAppButton';
import { getProducts, getCategories, getSettings, ensureInitialData } from '../lib/supabaseClient';
import { Product, Category, StoreSettings } from '../lib/types';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('todos');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showSizeGuide, setShowSizeGuide] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Load Data on Mount
  useEffect(() => {
    ensureInitialData();
    const loadStoreData = async () => {
      const [prods, cats, stg] = await Promise.all([
        getProducts(),
        getCategories(),
        getSettings()
      ]);
      setProducts(prods);
      setCategories(cats);
      setSettings(stg);

      if (stg?.themeMode) {
        if (stg.themeMode === 'auto') {
          const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
          document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        } else {
          document.documentElement.setAttribute('data-theme', stg.themeMode);
        }
      }
    };
    loadStoreData();

    // Listen to changes from Admin (localStorage / Supabase updates)
    const handleStoreChange = () => {
      loadStoreData();
    };
    window.addEventListener('tutienda_store_change', handleStoreChange);
    window.addEventListener('moscu_store_change', handleStoreChange);
    return () => {
      window.removeEventListener('tutienda_store_change', handleStoreChange);
      window.removeEventListener('moscu_store_change', handleStoreChange);
    };
  }, []);

  // Filter and Sort Products
  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (activeCategory !== 'todos') {
      list = list.filter(
        p => p.category === activeCategory || (p.tags && p.tags.some(t => t.toLowerCase().includes(activeCategory.toLowerCase())))
      );
    }

    switch (sortBy) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // featured / default
        list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    return list;
  }, [products, activeCategory, sortBy]);

  // Featured Drop 41 products
  const dropProducts = useMemo(() => {
    return products.filter(p => p.category === 'drop-41' || p.tags?.some(t => t.includes('DROP'))).slice(0, 4);
  }, [products]);

  // Liquidación products
  const saleProducts = useMemo(() => {
    return products.filter(p => p.isSale || p.tags?.some(t => t.includes('LIQUID'))).slice(0, 4);
  }, [products]);

  const handleSelectCategory = (slug: string) => {
    setActiveCategory(slug);
    const elem = document.getElementById('productos');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="storefront-wrapper">
      {/* Floating Admin Mode Pill */}
      <Link
        href="/admin"
        className="admin-mode-pill"
        title="Alternar entre la tienda y el panel de administración"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
        <span>Panel Admin</span>
      </Link>

      {/* Top Red Marquee Announcement */}
      <AnnouncementBar />

      {/* Header & Navigation */}
      <Header
        onSelectCategory={handleSelectCategory}
        onSelectProduct={(p) => setSelectedProduct(p)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <>
          <div className="cart-drawer-backdrop active" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="mobile-menu-drawer active">
            <div className="mobile-menu-header">
              <h3>Menú de Navegación</h3>
              <button
                type="button"
                className="cart-close-btn"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                ×
              </button>
            </div>
            <ul className="mobile-menu-list">
              <li>
                <button
                  type="button"
                  className={`mobile-menu-item ${activeCategory === 'todos' ? 'active' : ''}`}
                  onClick={() => {
                    handleSelectCategory('todos');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Ver Todo el Catálogo
                </button>
              </li>
              {categories.map(cat => (
                <li key={cat.id}>
                  <button
                    type="button"
                    className={`mobile-menu-item ${activeCategory === cat.slug ? 'active' : ''}`}
                    onClick={() => {
                      handleSelectCategory(cat.slug);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <span>{cat.name}</span>
                    {cat.badge && <span className="cat-pill-badge">{cat.badge}</span>}
                  </button>
                </li>
              ))}
              <li style={{ borderTop: '1px solid #e2e8f0', marginTop: '12px', paddingTop: '12px' }}>
                <Link
                  href="/admin"
                  className="mobile-menu-item"
                  style={{ color: '#2563eb', fontWeight: 700 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  ⚙️ Panel de Administración
                </Link>
              </li>
            </ul>
          </aside>
        </>
      )}

      {/* Hero Slider */}
      <HeroSlider onSelectCategory={handleSelectCategory} />

      {/* Trust Badges */}
      <TrustBadges badges={settings?.trustBadges} />

      {/* Visual Category Showcase Cards */}
      <CategoryCards onSelectCategory={handleSelectCategory} />

      {/* Curated Section 1: NUEVO DROP */}
      {dropProducts.length > 0 && activeCategory === 'todos' && (
        <section className="product-showcase-section" id="seccion-drop">
          <div className="section-header-bar">
            <div>
              <h2 className="section-title">Nuevo Drop 41</h2>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                Siluetas de edición limitada confeccionadas en telas de 13oz
              </p>
            </div>
            <button
              type="button"
              className="section-view-all"
              onClick={() => handleSelectCategory('drop-41')}
            >
              Ver Colección →
            </button>
          </div>
          <div className="products-grid">
            {dropProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenDetail={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Curated Section 2: LIQUIDACIÓN */}
      {saleProducts.length > 0 && activeCategory === 'todos' && (
        <section className="product-showcase-section" id="seccion-liquidacion">
          <div className="section-header-bar">
            <div>
              <h2 className="section-title">Liquidación Especial</h2>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                Prendas de temporadas anteriores con hasta 30% de rebaja
              </p>
            </div>
            <button
              type="button"
              className="section-view-all"
              onClick={() => handleSelectCategory('liquidacion')}
            >
              Ver Ofertas →
            </button>
          </div>
          <div className="products-grid">
            {saleProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenDetail={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Lookbook Banner */}
      <LookbookBanner
        lookbook={settings?.lookbook}
        onExplore={() => handleSelectCategory(settings?.lookbook?.categoryLink || 'pantalones')}
      />

      {/* Section 3: All / Filtered Products Grid */}
      <section className="product-showcase-section" id="productos">
        <div className="section-header-bar" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 className="section-title">
              {activeCategory === 'todos'
                ? 'Todos los Productos'
                : categories.find(c => c.slug === activeCategory)?.name || activeCategory.toUpperCase()}
            </h2>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              {filteredProducts.length} {filteredProducts.length === 1 ? 'prenda disponible' : 'prendas disponibles'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label htmlFor="sortSelect" style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
              Ordenar por:
            </label>
            <select
              id="sortSelect"
              className="admin-form-input"
              style={{ width: 'auto', padding: '6px 12px', fontSize: '13px' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="featured">Destacados</option>
              <option value="price-asc">Menor Precio</option>
              <option value="price-desc">Mayor Precio</option>
              <option value="name">Nombre (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Category Pills Navigation */}
        <div className="category-pills-bar">
          <button
            type="button"
            className={`cat-pill ${activeCategory === 'todos' ? 'active' : ''}`}
            onClick={() => setActiveCategory('todos')}
          >
            TODO ({products.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              type="button"
              className={`cat-pill ${activeCategory === cat.slug ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.slug)}
            >
              <span>{cat.name}</span>
              {cat.badge && <span className="cat-pill-badge">{cat.badge}</span>}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="products-grid">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenDetail={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>
        ) : (
          <div className="products-empty-box">
            <p>No encontramos prendas disponibles en esta categoría actualmente.</p>
            <button
              type="button"
              className="btn-admin-cta"
              onClick={() => setActiveCategory('todos')}
              style={{ marginTop: '12px' }}
            >
              Ver Todas las Prendas
            </button>
          </div>
        )}
      </section>

      {/* Newsletter */}
      <Newsletter />

      {/* Footer */}
      <Footer
        onSelectCategory={handleSelectCategory}
        onOpenSizeGuide={() => setShowSizeGuide(true)}
      />

      {/* Mobile Fixed Bottom Navigation Bar */}
      <MobileTabnav
        onSelectCategory={handleSelectCategory}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      {/* Floating WhatsApp Action Button */}
      <WhatsAppButton />

      {/* Slide-out Cart Drawer */}
      <CartDrawer />

      {/* PDP Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onOpenSizeGuide={() => setShowSizeGuide(true)}
        />
      )}

      {/* Size Guide Modal */}
      <SizeGuideModal
        isOpen={showSizeGuide}
        onClose={() => setShowSizeGuide(false)}
      />
    </div>
  );
}
