'use client';

/* ==========================================================================
   Moscú Showroom - Product Detail (PDP) Modal View
   ========================================================================== */

import React, { useState, useEffect } from 'react';
import { Product } from '../../lib/types';
import { useCart } from '../../context/CartContext';
import { useRouter } from 'next/navigation';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onOpenSizeGuide?: () => void;
}

export default function ProductModal({ product, onClose, onOpenSizeGuide }: ProductModalProps) {
  const { addToCart } = useCart();
  const router = useRouter();

  const [activeImage, setActiveImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [postalCode, setPostalCode] = useState('');
  const [shippingResults, setShippingResults] = useState<{
    correo: number;
    andreani: number;
    isFree: boolean;
  } | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string>('detalles');

  useEffect(() => {
    if (product) {
      setActiveImage(product.images?.[0] || '');
      const available = product.sizes?.find(s => s.stock > 0);
      setSelectedSize(available ? available.size : (product.sizes?.[0]?.size || 'Único'));
      setQuantity(1);
      setShippingResults(null);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [product]);

  if (!product) return null;

  const transferDiscount = product.transferDiscountPct || 15;
  const transferPrice = Math.round(product.price * (1 - (transferDiscount / 100)));
  const installmentVal = Math.round(product.price / 6);

  const handleAddToCart = () => {
    if (!selectedSize) return;
    setIsAdding(true);

    setTimeout(() => {
      addToCart(product, selectedSize, quantity);
      setIsAdding(false);
      setJustAdded(true);

      setTimeout(() => {
        setJustAdded(false);
        onClose();
      }, 400);
    }, 350);
  };

  const handleBuyNow = () => {
    if (!selectedSize) return;
    addToCart(product, selectedSize, quantity);
    onClose();
    router.push('/checkout');
  };

  const calculateShipping = () => {
    if (!postalCode.trim()) return;
    const isFree = product.price >= 150000;
    setShippingResults({
      correo: 5400,
      andreani: 6800,
      isFree
    });
  };

  return (
    <div className="pdp-modal-overlay active" onClick={onClose}>
      <div className="pdp-modal-container" onClick={(e) => e.stopPropagation()}>
        
        {/* Sticky Close Button */}
        <button
          type="button"
          className="pdp-modal-close"
          onClick={onClose}
          aria-label="Cerrar ventana de producto"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="pdp-grid">
          {/* Gallery Column */}
          <div className="pdp-gallery">
            <div className="pdp-thumbnails">
              {product.images?.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${product.name} foto ${idx + 1}`}
                  className={`pdp-thumb-img ${img === activeImage ? 'active' : ''}`}
                  onClick={() => setActiveImage(img)}
                />
              ))}
            </div>
            <div className="pdp-main-image-wrap">
              <img src={activeImage} alt={product.name} className="pdp-main-img" />
            </div>
          </div>

          {/* Product Details Column */}
          <div className="pdp-details">
            <div className="pdp-breadcrumbs">
              <span>TuTienda Showroom</span>
              <span>/</span>
              <span>{product.categoryName}</span>
              <span>/</span>
              <span>{product.name}</span>
            </div>

            <h2 className="pdp-title">{product.name}</h2>
            <div className="pdp-sku-line">SKU: {product.sku || 'MSC-001'}</div>

            {/* Pricing Box */}
            <div className="pdp-pricing-box">
              <div className="pdp-price-row">
                <span className="pdp-price-current">
                  ${product.price.toLocaleString('es-AR')}
                </span>
                {product.comparePrice && (
                  <span className="pdp-price-compare">
                    ${product.comparePrice.toLocaleString('es-AR')}
                  </span>
                )}
              </div>
              <div className="pdp-transfer-discount">
                💵 ${transferPrice.toLocaleString('es-AR')} con Transferencia ({transferDiscount}% OFF)
              </div>
              <div className="pdp-installments-line">
                <span>💳 Hasta <strong>6 cuotas sin interés</strong> de ${installmentVal.toLocaleString('es-AR')}</span>
                <a
                  onClick={() => alert('Medios de pago:\n• 15% OFF abonando por Transferencia Bancaria.\n• Hasta 6 cuotas sin interés con todas las tarjetas mediante Mercado Pago.')}
                >
                  Ver medios de pago
                </a>
              </div>
            </div>

            {/* Size Selection */}
            <div className="pdp-variant-section">
              <div className="pdp-size-header">
                <span className="pdp-size-label">
                  Talle seleccionado: <strong>{selectedSize}</strong>
                </span>
                <button
                  type="button"
                  className="pdp-size-guide-btn"
                  onClick={onOpenSizeGuide}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.3 15.3l-8.6-8.6a1 1 0 0 0-1.4 0l-8.6 8.6a1 1 0 0 0 0 1.4l2.6 2.6a1 1 0 0 0 1.4 0l7.9-7.9 7.9 7.9a1 1 0 0 0 1.4 0l2.6-2.6a1 1 0 0 0 0-1.4z"></path>
                  </svg>
                  <span>Guía de Talles</span>
                </button>
              </div>

              <div className="pdp-size-options">
                {product.sizes?.map(s => (
                  <button
                    key={s.size}
                    type="button"
                    className={`pdp-size-pill ${s.size === selectedSize ? 'selected' : ''} ${s.stock <= 0 ? 'out-of-stock' : ''}`}
                    onClick={() => s.stock > 0 && setSelectedSize(s.size)}
                    disabled={s.stock <= 0}
                    title={s.stock <= 0 ? 'Agotado' : `Talle ${s.size}`}
                  >
                    {s.size}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pdp-actions-row">
              <div className="pdp-qty-stepper">
                <button
                  type="button"
                  className="pdp-qty-btn"
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                >
                  -
                </button>
                <input
                  type="text"
                  className="pdp-qty-input"
                  value={quantity}
                  readOnly
                />
                <button
                  type="button"
                  className="pdp-qty-btn"
                  onClick={() => setQuantity(prev => prev + 1)}
                >
                  +
                </button>
              </div>

              <button
                type="button"
                className={`pdp-btn-add ${isAdding ? 'loading' : ''} ${justAdded ? 'success' : ''}`}
                onClick={handleAddToCart}
                disabled={isAdding}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                <span>
                  {isAdding ? 'Agregando...' : justAdded ? '¡Agregado!' : 'AGREGAR AL CARRITO'}
                </span>
              </button>
            </div>

            <button
              type="button"
              className="pdp-btn-buy-now"
              onClick={handleBuyNow}
            >
              COMPRAR AHORA
            </button>

            {/* Shipping Calculator */}
            <div className="pdp-shipping-calculator">
              <div className="shipping-calc-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="3" width="15" height="13"></rect>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                  <circle cx="5.5" cy="18.5" r="2.5"></circle>
                  <circle cx="18.5" cy="18.5" r="2.5"></circle>
                </svg>
                <span>Calculá el costo de envío</span>
              </div>
              <div className="shipping-calc-form">
                <input
                  type="text"
                  className="shipping-calc-input"
                  placeholder="Tu Código Postal (ej: 7150)"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                />
                <button
                  type="button"
                  className="shipping-calc-btn"
                  onClick={calculateShipping}
                >
                  CALCULAR
                </button>
              </div>

              {shippingResults && (
                <div className="shipping-calc-results" style={{ display: 'flex' }}>
                  <div className="shipping-result-item">
                    <div>
                      <strong>Correo Argentino a Domicilio</strong>
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>3 a 5 días hábiles</div>
                    </div>
                    <span>
                      {shippingResults.isFree ? (
                        <strong style={{ color: '#15803d' }}>¡GRATIS!</strong>
                      ) : (
                        `$${shippingResults.correo.toLocaleString('es-AR')}`
                      )}
                    </span>
                  </div>

                  <div className="shipping-result-item">
                    <div>
                      <strong>Andreani Prioritario</strong>
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>24 a 72hs hábiles</div>
                    </div>
                    <span>
                      {shippingResults.isFree ? (
                        <strong style={{ color: '#15803d' }}>¡GRATIS!</strong>
                      ) : (
                        `$${shippingResults.andreani.toLocaleString('es-AR')}`
                      )}
                    </span>
                  </div>

                  <div className="shipping-result-item">
                    <div>
                      <strong>Retiro en Showroom Ayacucho</strong>
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>9 de Julio 837 (Listo en 24hs)</div>
                    </div>
                    <strong style={{ color: '#15803d' }}>¡GRATIS!</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Accordions */}
            <div className="pdp-accordions">
              <div className={`pdp-accordion-item ${activeAccordion === 'detalles' ? 'active' : ''}`}>
                <button
                  type="button"
                  className="pdp-accordion-header"
                  onClick={() => setActiveAccordion(prev => prev === 'detalles' ? '' : 'detalles')}
                >
                  <span>Detalles y Composición</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                <div className="pdp-accordion-body">
                  <p style={{ marginBottom: '8px' }}>{product.description}</p>
                  {product.specs && (
                    <ul style={{ paddingLeft: '18px', marginTop: '6px', listStyle: 'disc' }}>
                      <li><strong>Composición:</strong> {product.specs.composicion || '100% Algodón'}</li>
                      <li><strong>Corte:</strong> {product.specs.corte || 'Oversize Boxy'}</li>
                      <li><strong>Cuidados:</strong> {product.specs.cuidados || 'Lavar en frío'}</li>
                    </ul>
                  )}
                </div>
              </div>

              <div className={`pdp-accordion-item ${activeAccordion === 'cambios' ? 'active' : ''}`}>
                <button
                  type="button"
                  className="pdp-accordion-header"
                  onClick={() => setActiveAccordion(prev => prev === 'cambios' ? '' : 'cambios')}
                >
                  <span>Cambios y Devoluciones</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                <div className="pdp-accordion-body">
                  Los cambios se gestionan dentro de los 30 días posteriores a la recepción de la prenda. Podés tramitarlo por WhatsApp o directamente en nuestro Showroom de Ayacucho con las prendas en perfecto estado y etiquetas originales.
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
