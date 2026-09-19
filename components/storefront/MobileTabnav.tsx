'use client';

/* ==========================================================================
   Moscú Showroom - Mobile Fixed Bottom Navigation (Tabnav)
   ========================================================================== */

import React from 'react';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';

interface MobileTabnavProps {
  onSelectCategory?: (slug: string) => void;
  onOpenMobileMenu?: () => void;
}

export default function MobileTabnav({ onSelectCategory, onOpenMobileMenu }: MobileTabnavProps) {
  const { totalQuantity, openCart } = useCart();

  return (
    <nav className="mobile-tabnav" aria-label="Navegación móvil">
      <Link
        href="/"
        className="tabnav-btn active"
        onClick={() => onSelectCategory && onSelectCategory('todos')}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        <span>Inicio</span>
      </Link>

      <button
        type="button"
        className="tabnav-btn"
        onClick={onOpenMobileMenu}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
        <span>Menú</span>
      </button>

      <a
        href="#productos"
        className="tabnav-btn"
        onClick={(e) => {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <span>Buscar</span>
      </a>

      <Link href="/admin" className="tabnav-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
        <span>Admin</span>
      </Link>

      <button
        type="button"
        className="tabnav-btn"
        onClick={openCart}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
        {totalQuantity > 0 && (
          <span className="tabnav-cart-count">{totalQuantity}</span>
        )}
        <span>Carrito</span>
      </button>
    </nav>
  );
}
