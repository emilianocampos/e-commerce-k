'use client';

/* ==========================================================================
   Moscú Showroom - Product Card Component (3:4 ratio with hover flip)
   ========================================================================== */

import React, { useState } from 'react';
import { Product } from '../../lib/types';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
  onOpenDetail?: (product: Product) => void;
}

export default function ProductCard({ product, onOpenDetail }: ProductCardProps) {
  const { addToCart } = useCart();

  // Find first size with stock, or default to first size
  const firstAvailable = product.sizes?.find(s => s.stock > 0);
  const [selectedSize, setSelectedSize] = useState<string>(
    firstAvailable ? firstAvailable.size : (product.sizes?.[0]?.size || 'Único')
  );
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const transferDiscount = product.transferDiscountPct || 15;
  const transferPrice = Math.round(product.price * (1 - (transferDiscount / 100)));
  const installmentVal = Math.round(product.price / 6);

  const primaryImg = product.images?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop';
  const secondaryImg = product.images?.[1] || primaryImg;

  const handleQuickAdd = () => {
    if (!selectedSize) return;
    setIsAdding(true);

    setTimeout(() => {
      addToCart(product, selectedSize, 1);
      setIsAdding(false);
      setJustAdded(true);

      setTimeout(() => {
        setJustAdded(false);
      }, 1500);
    }, 300);
  };

  return (
    <div className="product-card">
      {/* Image Box with hover flip */}
      <div
        className="product-image-box"
        onClick={() => onOpenDetail && onOpenDetail(product)}
      >
        <div className="product-badges">
          {product.tags?.map(tag => (
            <span
              key={tag}
              className={`badge-tag ${
                tag.includes('LIQUID') ? 'sale' : tag.includes('DROP') ? 'new' : 'hot'
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
        <img src={primaryImg} alt={product.name} className="product-img-primary" loading="lazy" />
        <img src={secondaryImg} alt={product.name} className="product-img-secondary" loading="lazy" />
      </div>

      {/* Details */}
      <div className="product-info-box">
        <span className="product-category-label">{product.categoryName}</span>
        <h3
          className="product-title"
          onClick={() => onOpenDetail && onOpenDetail(product)}
        >
          {product.name}
        </h3>

        <div className="product-pricing">
          <div className="price-row">
            <span className="product-price-regular">
              ${product.price.toLocaleString('es-AR')}
            </span>
            {product.comparePrice && (
              <span className="product-price-compare">
                ${product.comparePrice.toLocaleString('es-AR')}
              </span>
            )}
          </div>
          <div className="product-price-transfer">
            💵 ${transferPrice.toLocaleString('es-AR')} ({transferDiscount}% OFF con Transferencia)
          </div>
          <div className="product-installments">
            💳 6 cuotas sin interés de <strong>${installmentVal.toLocaleString('es-AR')}</strong>
          </div>
        </div>

        {/* Size Chips */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="product-size-chips">
            {product.sizes.map(s => (
              <button
                key={s.size}
                type="button"
                className={`size-chip ${s.size === selectedSize ? 'selected' : ''} ${s.stock <= 0 ? 'disabled' : ''}`}
                onClick={() => s.stock > 0 && setSelectedSize(s.size)}
                disabled={s.stock <= 0}
                title={s.stock <= 0 ? 'Agotado' : `Talle ${s.size}`}
              >
                {s.size}
              </button>
            ))}
          </div>
        )}

        {/* Quick Add Button */}
        <button
          type="button"
          className={`btn-quick-add ${justAdded ? 'added' : ''}`}
          onClick={handleQuickAdd}
          disabled={isAdding}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          <span>
            {isAdding ? 'Agregando...' : justAdded ? '¡Listo!' : 'AGREGAR AL CARRITO'}
          </span>
        </button>
      </div>
    </div>
  );
}
