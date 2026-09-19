'use client';

/* ==========================================================================
   Moscú Showroom - Main Header & Navigation
   ========================================================================== */

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import { getCategories, getProducts, getSettings } from '../../lib/supabaseClient';
import { Category, Product } from '../../lib/types';

interface HeaderProps {
  onSelectCategory?: (slug: string) => void;
  onOpenMobileMenu?: () => void;
  onSelectProduct?: (product: Product) => void;
}

export default function Header({
  onSelectCategory,
  onOpenMobileMenu,
  onSelectProduct
}: HeaderProps) {
  const { totalQuantity, openCart } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [storeName, setStoreName] = useState('MiTienda');
  const [storeTagline, setStoreTagline] = useState('TIENDA ONLINE • SHOWROOM');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('dark');

  const updateFromSettings = (s: any) => {
    if (s?.storeName) {
      const clean = (s.storeName.includes('Moscú') || s.storeName.includes('TuTienda')) ? 'MiTienda' : s.storeName;
      setStoreName(clean);
    }
    if (s?.storeTagline) setStoreTagline(s.storeTagline);
    
    // Check if user has explicit saved theme preference first
    const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('mitienda_theme') as 'light' | 'dark' | null : null;
    if (savedTheme) {
      setCurrentTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
      if (document.body) document.body.setAttribute('data-theme', savedTheme);
      return;
    }

    if (s?.themeMode) {
      const mode = s.themeMode === 'auto'
        ? (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : s.themeMode;
      setCurrentTheme(mode);
      document.documentElement.setAttribute('data-theme', mode);
      if (document.body) document.body.setAttribute('data-theme', mode);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('mitienda_theme') as 'light' | 'dark' | null;
    if (saved) {
      setCurrentTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
      if (document.body) document.body.setAttribute('data-theme', saved);
    }

    getCategories().then(setCategories);
    getProducts().then(setAllProducts);
    getSettings().then(updateFromSettings);

    const handleUpdate = async () => {
      const s = await getSettings();
      updateFromSettings(s);
    };

    window.addEventListener('mitienda_store_change', handleUpdate);
    window.addEventListener('tutienda_store_change', handleUpdate);
    window.addEventListener('moscu_store_change', handleUpdate);
    return () => {
      window.removeEventListener('mitienda_store_change', handleUpdate);
      window.removeEventListener('tutienda_store_change', handleUpdate);
      window.removeEventListener('moscu_store_change', handleUpdate);
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setCurrentTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    if (document.body) document.body.setAttribute('data-theme', nextTheme);
    localStorage.setItem('mitienda_theme', nextTheme);
  };

  // Handle Search Input
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) {
      setSearchResults([]);
      setShowSuggest(false);
      return;
    }

    const matches = allProducts.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.categoryName.toLowerCase().includes(q) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
    ).slice(0, 5);

    setSearchResults(matches);
    setShowSuggest(true);
  }, [searchQuery, allProducts]);

  // Close search suggest when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggest(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <header className="head-main">
      <div className="header-container">
        <div className="header-top-row">
          
          {/* Search Bar (Desktop) */}
          <div className="header-search-form" ref={searchContainerRef}>
            <div className="search-input-wrapper">
              <input
                type="text"
                className="search-input"
                placeholder="¿Qué estás buscando?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => { if (searchQuery.length >= 2) setShowSuggest(true); }}
                autoComplete="off"
              />
              <button type="button" className="search-btn" aria-label="Buscar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
            </div>

            {/* Search Suggest Box */}
            {showSuggest && (
              <div className="search-suggest-box active">
                {searchResults.length > 0 ? (
                  searchResults.map(p => (
                    <div
                      key={p.id}
                      className="search-suggest-item"
                      onClick={() => {
                        setShowSuggest(false);
                        setSearchQuery('');
                        if (onSelectProduct) onSelectProduct(p);
                      }}
                    >
                      <img src={p.images[0]} alt={p.name} className="search-suggest-thumb" />
                      <div className="search-suggest-info">
                        <h4>{p.name}</h4>
                        <span>${p.price.toLocaleString('es-AR')} • {p.categoryName}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '14px', textAlign: 'center', fontSize: '12px', color: '#6b7280' }}>
                    No encontramos prendas para &quot;{searchQuery}&quot;
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Centered Brand Logo */}
          <div className="header-logo">
            <Link href="/" onClick={() => onSelectCategory && onSelectCategory('todos')}>
              <h1 className="header-logo-text">{storeName}</h1>
              <div className="header-logo-sub">{storeTagline}</div>
            </Link>
          </div>

          {/* Utilities (Right) */}
          <div className="header-utilities">
            {/* Theme Toggle (Light / Dark) */}
            <button
              type="button"
              id="theme-toggle-btn"
              className="utility-link theme-toggle-btn"
              onClick={toggleTheme}
              title={currentTheme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              aria-label="Alternar tema claro y oscuro"
            >
              {currentTheme === 'dark' ? (
                /* Sun Icon */
                <svg className="utility-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              ) : (
                /* Moon Icon */
                <svg className="utility-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              )}
            </button>

            {/* Account */}
            <a
              href="#"
              className="utility-link"
              onClick={(e) => {
                e.preventDefault();
                alert(`${storeName} Club: Iniciar sesión o crear cuenta para comprar.`);
              }}
              title="Mi Cuenta"
            >
              <svg className="utility-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </a>

            {/* Cart Trigger */}
            <button
              type="button"
              className="utility-link"
              onClick={openCart}
              title="Carrito de Compras"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <svg className="utility-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              {totalQuantity > 0 && (
                <span className="cart-badge">{totalQuantity}</span>
              )}
            </button>
          </div>

        </div>

        {/* Desktop Navigation Bar */}
        <nav className="nav-desktop-bar">
          <ul className="nav-desktop-list">
            <li>
              <Link href="/" className="nav-item-link" onClick={() => onSelectCategory && onSelectCategory('todos')}>
                Inicio
              </Link>
            </li>
            <li className="nav-item-dropdown">
              <a href="#" className="nav-item-link" onClick={(e) => e.preventDefault()}>
                <span>Productos</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </a>
              <div className="dropdown-menu-box">
                {categories.map(cat => (
                  <a
                    key={cat.id}
                    href="#productos"
                    className="dropdown-item-link"
                    onClick={(e) => {
                      e.preventDefault();
                      if (onSelectCategory) onSelectCategory(cat.slug);
                    }}
                  >
                    <span>{cat.name}</span>
                    {cat.badge && (
                      <span className="dropdown-item-badge">{cat.badge}</span>
                    )}
                  </a>
                ))}
              </div>
            </li>
            <li>
              <a
                href="#productos"
                className="nav-item-link highlight"
                onClick={(e) => {
                  e.preventDefault();
                  if (onSelectCategory) onSelectCategory('liquidacion');
                }}
              >
                Liquidación!
              </a>
            </li>
            <li>
              <a href="#lookbook" className="nav-item-link">Comprá el Outfit</a>
            </li>
            <li>
              <a href="#showroom" className="nav-item-link">Nuestro Showroom</a>
            </li>
            <li>
              <Link href="/admin" className="nav-item-link" style={{ color: '#2563eb', fontWeight: 700 }}>
                ⚙️ Panel Admin
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
