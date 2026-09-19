'use client';

/* ==========================================================================
   Moscú Showroom - Slide-out Cart Drawer Component
   ========================================================================== */

import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useRouter } from 'next/navigation';

export default function CartDrawer() {
  const {
    items,
    coupon,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeItem,
    applyCoupon,
    removeCoupon,
    subtotal,
    discountAmount,
    total,
    transferTotal,
    freeShippingProgress
  } = useCart();

  const router = useRouter();
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');

  if (!isCartOpen) return null;

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    const res = applyCoupon(couponCode);
    if (!res.success) {
      setCouponError(res.message || 'Cupón inválido');
    } else {
      setCouponError('');
      setCouponCode('');
    }
  };

  const handleGoToCheckout = () => {
    closeCart();
    router.push('/checkout');
  };

  return (
    <>
      <div className="cart-drawer-backdrop active" onClick={closeCart} />
      <aside className="cart-drawer active">
        {/* Header */}
        <div className="cart-header">
          <h3>Carrito de Compras</h3>
          <button
            type="button"
            className="cart-close-btn"
            onClick={closeCart}
            aria-label="Cerrar carrito"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {items.length > 0 ? (
          <>
            {/* Free Shipping Bar */}
            <div className="cart-free-shipping-box">
              {freeShippingProgress.isFree ? (
                <div className="free-shipping-message success">
                  <span>¡Genial! Tenés ENVÍO GRATIS</span>
                  <span>🚚</span>
                </div>
              ) : (
                <div className="free-shipping-message">
                  <span>
                    ¡Estás a <strong>${freeShippingProgress.difference.toLocaleString('es-AR')}</strong> de tener ENVÍO GRATIS!
                  </span>
                  <span>🚚</span>
                </div>
              )}
              <div className="free-shipping-bar-track">
                <div
                  className="free-shipping-bar-fill"
                  style={{ width: `${freeShippingProgress.progressPct}%` }}
                />
              </div>
            </div>

            {/* Items List */}
            <div className="cart-items-list">
              {items.map(item => (
                <div key={item.id} className="cart-item-card">
                  <img src={item.image} alt={item.name} className="cart-item-img" />
                  <div className="cart-item-info">
                    <div className="cart-item-top">
                      <span className="cart-item-name">{item.name}</span>
                      <button
                        type="button"
                        className="cart-item-remove"
                        onClick={() => removeItem(item.id)}
                        title="Eliminar prenda"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>

                    <span className="cart-item-size">Talle: <strong>{item.size}</strong></span>

                    <div className="cart-item-bottom">
                      <div className="cart-item-stepper">
                        <button
                          type="button"
                          className="cart-item-btn"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span className="cart-item-qty">{item.quantity}</span>
                        <button
                          type="button"
                          className="cart-item-btn"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <span className="cart-item-price">
                        ${(item.price * item.quantity).toLocaleString('es-AR')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer & Totals */}
            <div className="cart-footer">
              <div className="cart-collapsibles">
                {coupon ? (
                  <div className="applied-coupon-pill">
                    <span>Cupón: <strong>{coupon.code}</strong> ({coupon.discountPct}% OFF)</span>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#166534', fontWeight: 700 }}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="cart-coupon-form">
                      <input
                        type="text"
                        className="cart-coupon-input"
                        placeholder="CUPÓN DE DESCUENTO"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                      />
                      <button
                        type="button"
                        className="cart-coupon-btn"
                        onClick={handleApplyCoupon}
                      >
                        APLICAR
                      </button>
                    </div>
                    {couponError && (
                      <span style={{ color: '#dc2626', fontSize: '11px', display: 'block', marginTop: '4px' }}>
                        {couponError}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="cart-totals-breakdown">
                <div className="cart-total-row">
                  <span>Subtotal:</span>
                  <span>${subtotal.toLocaleString('es-AR')}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="cart-total-row" style={{ color: '#15803d', fontWeight: 600 }}>
                    <span>Descuento cupón:</span>
                    <span>-${discountAmount.toLocaleString('es-AR')}</span>
                  </div>
                )}
                <div className="cart-total-row final">
                  <span>Total:</span>
                  <span>${total.toLocaleString('es-AR')}</span>
                </div>
                <div className="cart-transfer-badge">
                  O <strong>${transferTotal.toLocaleString('es-AR')}</strong> pagando por Transferencia (15% OFF)
                </div>
              </div>

              <button
                type="button"
                className="btn-checkout-start"
                onClick={handleGoToCheckout}
              >
                <span>INICIAR COMPRA</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>
          </>
        ) : (
          <div className="cart-empty-state">
            <svg className="cart-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <h4 className="cart-empty-title">Tu carrito está vacío</h4>
            <p style={{ fontSize: '13px' }}>Explorá nuestros últimos drops y prendas exclusivas.</p>
            <button
              type="button"
              className="cart-empty-btn"
              onClick={closeCart}
            >
              Ver Productos
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
