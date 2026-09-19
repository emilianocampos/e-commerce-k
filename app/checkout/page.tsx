'use client';

/* ==========================================================================
   Moscú Showroom - Multi-Step Checkout Page (Next.js App Router)
   ========================================================================== */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { createOrder, getSettings } from '../../lib/supabaseClient';
import { StoreSettings, ShippingOption, PaymentOption, Order } from '../../lib/types';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, coupon, subtotal, discountAmount, clearCart } = useCart();
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  // Steps: 1: Contacto, 2: Entrega, 3: Pago, 4: Confirmado
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Customer Contact
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dni, setDni] = useState('');

  // Step 2: Shipping
  const [shippingMethod, setShippingMethod] = useState<'correo' | 'andreani' | 'showroom'>('correo');
  const [street, setStreet] = useState('');
  const [streetNumber, setStreetNumber] = useState('');
  const [floor, setFloor] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('Buenos Aires');
  const [postalCode, setPostalCode] = useState('');

  // Step 3: Payment
  const [paymentMethod, setPaymentMethod] = useState<'transferencia' | 'mercadopago'>('transferencia');
  const [copiedCbu, setCopiedCbu] = useState(false);

  // Step 4: Completed Order
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  const freeShippingThreshold = settings?.freeShippingThreshold || 150000;
  const isFreeShipping = subtotal >= freeShippingThreshold;

  const shippingCost = (() => {
    if (shippingMethod === 'showroom') return 0;
    if (isFreeShipping) return 0;
    if (shippingMethod === 'correo') return settings?.shippingCosts?.correoArgentino || 5500;
    if (shippingMethod === 'andreani') return settings?.shippingCosts?.andreani || 7500;
    return 0;
  })();

  const transferDiscountPct = settings?.transferDiscountPct || 15;
  const transferDiscountAmount = paymentMethod === 'transferencia'
    ? Math.round((subtotal - discountAmount) * (transferDiscountPct / 100))
    : 0;

  const finalTotal = Math.max(0, subtotal - discountAmount - transferDiscountAmount + shippingCost);

  // Validate step 1
  const handleProceedToShipping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name || !phone || !dni) {
      setErrorMsg('Por favor completá todos los datos de contacto y facturación.');
      return;
    }
    setErrorMsg('');
    setCurrentStep(2);
  };

  // Validate step 2
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (shippingMethod !== 'showroom' && (!street || !city || !postalCode)) {
      setErrorMsg('Por favor completá la dirección de entrega.');
      return;
    }
    setErrorMsg('');
    setCurrentStep(3);
  };

  // Finalize order
  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    setErrorMsg('');

    const shippingOption: ShippingOption = {
      method: isFreeShipping ? 'gratis' : shippingMethod,
      name:
        shippingMethod === 'showroom'
          ? 'Retiro en Showroom Ayacucho (9 de Julio 837)'
          : shippingMethod === 'correo'
          ? 'Correo Argentino a Domicilio'
          : 'Andreani Expreso',
      cost: shippingCost
    };

    const paymentOption: PaymentOption = {
      method: paymentMethod,
      name:
        paymentMethod === 'transferencia'
          ? 'Transferencia Bancaria (15% OFF)'
          : 'Mercado Pago (Hasta 6 Cuotas Sin Interés)',
      discountPct: paymentMethod === 'transferencia' ? transferDiscountPct : 0,
      discountAmount: transferDiscountAmount
    };

    const newOrder: Order = {
      id: `MSC-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString(),
      customer: {
        email,
        name,
        phone,
        dni,
        address: {
          street,
          number: streetNumber,
          floor,
          city,
          province,
          postalCode
        }
      },
      items,
      shipping: shippingOption,
      payment: paymentOption,
      subtotal,
      total: finalTotal,
      status: 'Pendiente'
    };

    try {
      const saved = await createOrder(newOrder);
      setCompletedOrder(saved);
      clearCart();
      setCurrentStep(4);
    } catch (err: any) {
      setErrorMsg('Ocurrió un error al registrar el pedido. Intentá nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedCbu(true);
      setTimeout(() => setCopiedCbu(false), 2000);
    }
  };

  // If cart is empty and not in confirmation step
  if (items.length === 0 && currentStep !== 4) {
    return (
      <div className="storefront-wrapper" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '40px 20px', maxWidth: '400px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛍️</div>
          <h2 style={{ fontFamily: 'var(--heading-font)', fontSize: '24px', marginBottom: '10px' }}>Tu carrito está vacío</h2>
          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>
            No tenés prendas seleccionadas para realizar el checkout.
          </p>
          <Link href="/" className="btn-admin-cta" style={{ display: 'inline-block', padding: '12px 24px' }}>
            Explorar Tienda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="storefront-wrapper" style={{ background: '#f8fafc', minHeight: '100vh', padding: '24px 16px' }}>
      <div className="checkout-card" style={{ margin: '0 auto', maxWidth: '960px', background: '#ffffff' }}>
        {/* Header */}
        <header className="checkout-header">
          <Link href="/" style={{ textDecoration: 'none' }}>
            <h1 className="header-logo-text" style={{ fontSize: '22px' }}>{settings?.storeName || 'TuTienda'}!</h1>
            <div className="header-logo-sub" style={{ fontSize: '9px' }}>CHECKOUT SEGURO</div>
          </Link>

          {currentStep < 4 && (
            <div className="checkout-steps-bar">
              <div className={`checkout-step-tab ${currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : ''}`}>
                <span className="checkout-step-num">{currentStep > 1 ? '✓' : '1'}</span>
                <span>Contacto</span>
              </div>
              <div className={`checkout-step-tab ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : ''}`}>
                <span className="checkout-step-num">{currentStep > 2 ? '✓' : '2'}</span>
                <span>Entrega</span>
              </div>
              <div className={`checkout-step-tab ${currentStep === 3 ? 'active' : ''}`}>
                <span className="checkout-step-num">3</span>
                <span>Pago</span>
              </div>
            </div>
          )}
        </header>

        {/* Step 4: Order Confirmed Screen */}
        {currentStep === 4 && completedOrder && (
          <div className="order-confirmed-screen">
            <div className="order-success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h2 style={{ fontFamily: 'var(--heading-font)', fontSize: '26px', fontWeight: 700, marginBottom: '6px' }}>
              ¡Muchas Gracias por tu Compra!
            </h2>
            <p style={{ color: '#4b5563', fontSize: '15px' }}>
              Tu orden ha sido registrada exitosamente con el código:
            </p>
            <div className="order-number-badge">ORDEN #{completedOrder.id}</div>

            {completedOrder.payment.method === 'transferencia' && (
              <div className="bank-transfer-details-box" style={{ maxWidth: '480px', textAlign: 'left', marginBottom: '16px' }}>
                <strong style={{ display: 'block', marginBottom: '8px' }}>💳 Datos para realizar la Transferencia:</strong>
                <div><strong>Titular:</strong> {settings?.bankTransferData?.titular || 'TUTIENDA S.R.L.'}</div>
                <div><strong>Banco:</strong> {settings?.bankTransferData?.banco || 'Banco Galicia'}</div>
                <div><strong>CBU:</strong> {settings?.bankTransferData?.cbu || '0140323501980001234567'}</div>
                <div><strong>Alias:</strong> {settings?.bankTransferData?.alias || 'TUTIENDA.OFICIAL'}</div>
                <div><strong>CUIT:</strong> {settings?.bankTransferData?.cuit || '30-71829304-9'}</div>
                <div style={{ marginTop: '8px', fontWeight: 700, color: '#15803d' }}>
                  Total con 15% OFF a transferir: ${completedOrder.total.toLocaleString('es-AR')}
                </div>
              </div>
            )}

            <p style={{ fontSize: '13px', color: '#6b7280', maxWidth: '440px', lineHeight: 1.5 }}>
              Enviá el comprobante de tu compra por WhatsApp para que comencemos a despachar tus prendas de inmediato.
            </p>

            <a
              href={`https://wa.me/${(settings?.phoneWhatsapp || '5492494123456').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                `Hola ${settings?.storeName || 'TuTienda'}! Acabo de realizar el pedido *#${completedOrder.id}* en la tienda online por un total de $${completedOrder.total.toLocaleString(
                  'es-AR'
                )}.\nMi nombre es ${completedOrder.customer.name}.\n¡Aguardo su confirmación para el despacho!`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp-order"
            >
              <span>Confirmar Pedido por WhatsApp</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.54 1.861.86 2.793.86 3.182 0 5.769-2.587 5.769-5.766 0-3.181-2.587-5.766-5.766-5.766zm9.969 5.766c0 5.514-4.486 10-10 10-1.724 0-3.356-.441-4.787-1.227l-5.213 1.365 1.39-5.078c-.89-1.49-1.39-3.23-1.39-5.06 0-5.514 4.486-10 10-10s10 4.486 10 10z" />
              </svg>
            </a>

            <Link href="/" style={{ marginTop: '20px', fontSize: '13px', color: '#4b5563', textDecoration: 'underline' }}>
              Volver a la Tienda Online
            </Link>
          </div>
        )}

        {/* Multi-step Body */}
        {currentStep < 4 && (
          <div className="checkout-body">
            {/* Form Column */}
            <div className="checkout-form-side">
              {errorMsg && (
                <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: '4px', fontSize: '13px', marginBottom: '16px' }}>
                  {errorMsg}
                </div>
              )}

              {/* STEP 1: CONTACTO */}
              {currentStep === 1 && (
                <form onSubmit={handleProceedToShipping}>
                  <h3 className="form-label" style={{ fontSize: '16px', marginBottom: '16px' }}>
                    1. Datos de Contacto y Facturación
                  </h3>
                  <div className="form-field-group">
                    <label className="form-label">Correo Electrónico *</label>
                    <input
                      type="email"
                      className="form-input"
                      required
                      placeholder="nombre@ejemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="form-field-group">
                    <label className="form-label">Nombre y Apellido Completo *</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      placeholder="Juan Pérez"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="form-row-2">
                    <div className="form-field-group">
                      <label className="form-label">Teléfono / WhatsApp *</label>
                      <input
                        type="tel"
                        className="form-input"
                        required
                        placeholder="11 2345-6789"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div className="form-field-group">
                      <label className="form-label">DNI / CUIT *</label>
                      <input
                        type="text"
                        className="form-input"
                        required
                        placeholder="12345678"
                        value={dni}
                        onChange={(e) => setDni(e.target.value)}
                      />
                    </div>
                  </div>

                  <button type="submit" className="checkout-btn-next" style={{ width: '100%' }}>
                    <span>Continuar a Entrega →</span>
                  </button>
                </form>
              )}

              {/* STEP 2: ENTREGA */}
              {currentStep === 2 && (
                <form onSubmit={handleProceedToPayment}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 className="form-label" style={{ fontSize: '16px', margin: 0 }}>
                      2. Método y Dirección de Entrega
                    </h3>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '12px', cursor: 'pointer' }}
                    >
                      Editar Contacto
                    </button>
                  </div>

                  <div className="shipping-options-list">
                    <label
                      className={`option-radio-card ${shippingMethod === 'correo' ? 'selected' : ''}`}
                      onClick={() => setShippingMethod('correo')}
                    >
                      <div className="option-radio-left">
                        <input
                          type="radio"
                          name="shippingOption"
                          checked={shippingMethod === 'correo'}
                          onChange={() => setShippingMethod('correo')}
                        />
                        <div>
                          <div className="option-radio-title">Correo Argentino a Domicilio</div>
                          <div className="option-radio-desc">3 a 5 días hábiles con seguimiento</div>
                        </div>
                      </div>
                      <div className="option-radio-price">
                        {isFreeShipping ? (
                          <span style={{ color: '#15803d' }}>¡GRATIS!</span>
                        ) : (
                          `$${(settings?.shippingCosts?.correoArgentino || 5500).toLocaleString('es-AR')}`
                        )}
                      </div>
                    </label>

                    <label
                      className={`option-radio-card ${shippingMethod === 'andreani' ? 'selected' : ''}`}
                      onClick={() => setShippingMethod('andreani')}
                    >
                      <div className="option-radio-left">
                        <input
                          type="radio"
                          name="shippingOption"
                          checked={shippingMethod === 'andreani'}
                          onChange={() => setShippingMethod('andreani')}
                        />
                        <div>
                          <div className="option-radio-title">Andreani Prioritario</div>
                          <div className="option-radio-desc">24 a 72hs hábiles a todo el país</div>
                        </div>
                      </div>
                      <div className="option-radio-price">
                        {isFreeShipping ? (
                          <span style={{ color: '#15803d' }}>¡GRATIS!</span>
                        ) : (
                          `$${(settings?.shippingCosts?.andreani || 7500).toLocaleString('es-AR')}`
                        )}
                      </div>
                    </label>

                    <label
                      className={`option-radio-card ${shippingMethod === 'showroom' ? 'selected' : ''}`}
                      onClick={() => setShippingMethod('showroom')}
                    >
                      <div className="option-radio-left">
                        <input
                          type="radio"
                          name="shippingOption"
                          checked={shippingMethod === 'showroom'}
                          onChange={() => setShippingMethod('showroom')}
                        />
                        <div>
                          <div className="option-radio-title">Retiro en Showroom Ayacucho</div>
                          <div className="option-radio-desc">9 de Julio 837 (Listo en 24hs hábiles)</div>
                        </div>
                      </div>
                      <div className="option-radio-price">
                        <span style={{ color: '#15803d' }}>¡GRATIS!</span>
                      </div>
                    </label>
                  </div>

                  {shippingMethod !== 'showroom' && (
                    <div style={{ marginTop: '20px' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '10px' }}>Dirección de Destino:</h4>
                      <div className="form-row-2">
                        <div className="form-field-group">
                          <label className="form-label">Calle *</label>
                          <input
                            type="text"
                            className="form-input"
                            required
                            placeholder="Av. San Martín"
                            value={street}
                            onChange={(e) => setStreet(e.target.value)}
                          />
                        </div>
                        <div className="form-field-group">
                          <label className="form-label">Altura / Número *</label>
                          <input
                            type="text"
                            className="form-input"
                            required
                            placeholder="1234"
                            value={streetNumber}
                            onChange={(e) => setStreetNumber(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="form-row-2">
                        <div className="form-field-group">
                          <label className="form-label">Ciudad / Localidad *</label>
                          <input
                            type="text"
                            className="form-input"
                            required
                            placeholder="Ayacucho"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                          />
                        </div>
                        <div className="form-field-group">
                          <label className="form-label">Código Postal *</label>
                          <input
                            type="text"
                            className="form-input"
                            required
                            placeholder="7150"
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="form-field-group">
                        <label className="form-label">Provincia</label>
                        <input
                          type="text"
                          className="form-input"
                          value={province}
                          onChange={(e) => setProvince(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  <button type="submit" className="checkout-btn-next" style={{ width: '100%' }}>
                    <span>Continuar a Forma de Pago →</span>
                  </button>
                </form>
              )}

              {/* STEP 3: PAGO */}
              {currentStep === 3 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 className="form-label" style={{ fontSize: '16px', margin: 0 }}>
                      3. Método de Pago
                    </h3>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '12px', cursor: 'pointer' }}
                    >
                      Editar Entrega
                    </button>
                  </div>

                  <div className="payment-options-list">
                    <label
                      className={`option-radio-card ${paymentMethod === 'transferencia' ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod('transferencia')}
                    >
                      <div className="option-radio-left">
                        <input
                          type="radio"
                          name="paymentOption"
                          checked={paymentMethod === 'transferencia'}
                          onChange={() => setPaymentMethod('transferencia')}
                        />
                        <div>
                          <div className="option-radio-title">💵 Transferencia Bancaria Directa</div>
                          <div className="option-radio-desc" style={{ color: '#15803d', fontWeight: 600 }}>
                            ¡15% OFF de descuento inmediato en tu compra!
                          </div>
                        </div>
                      </div>
                      <div className="option-radio-price" style={{ color: '#15803d' }}>
                        15% OFF
                      </div>
                    </label>

                    <label
                      className={`option-radio-card ${paymentMethod === 'mercadopago' ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod('mercadopago')}
                    >
                      <div className="option-radio-left">
                        <input
                          type="radio"
                          name="paymentOption"
                          checked={paymentMethod === 'mercadopago'}
                          onChange={() => setPaymentMethod('mercadopago')}
                        />
                        <div>
                          <div className="option-radio-title">💳 Tarjetas de Crédito / Débito (Mercado Pago)</div>
                          <div className="option-radio-desc">Hasta 6 Cuotas Sin Interés con todos los bancos</div>
                        </div>
                      </div>
                      <div className="option-radio-price">
                        6 Cuotas
                      </div>
                    </label>
                  </div>

                  {paymentMethod === 'transferencia' && (
                    <div className="bank-transfer-details-box">
                      <strong style={{ display: 'block', marginBottom: '6px' }}>Datos para transferir:</strong>
                      <div><strong>Titular:</strong> {settings?.bankTransferData?.titular || 'TUTIENDA S.R.L.'}</div>
                      <div><strong>Banco:</strong> {settings?.bankTransferData?.banco || 'Banco Galicia'}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
                        <span><strong>CBU:</strong> {settings?.bankTransferData?.cbu || '0070123130004019283741'}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(settings?.bankTransferData?.cbu || '0070123130004019283741')}
                          style={{ background: '#dcfce7', border: '1px solid #86efac', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
                        >
                          {copiedCbu ? '¡Copiado!' : 'Copiar'}
                        </button>
                      </div>
                      <div><strong>Alias:</strong> {settings?.bankTransferData?.alias || 'TUTIENDA.OFICIAL'}</div>
                      <div><strong>CUIT:</strong> {settings?.bankTransferData?.cuit || '30-71829304-9'}</div>
                    </div>
                  )}

                  <button
                    type="button"
                    className="checkout-btn-next"
                    style={{ width: '100%' }}
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting}
                  >
                    <span>{isSubmitting ? 'Procesando Pedido...' : 'FINALIZAR COMPRA'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Summary Column */}
            <div className="checkout-summary-side">
              <h4 className="checkout-summary-title">Resumen de Compra ({items.length})</h4>

              <div className="checkout-summary-items">
                {items.map(item => (
                  <div key={item.id} className="checkout-summary-item">
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{ width: '42px', height: '52px', objectFit: 'cover', borderRadius: '3px' }}
                    />
                    <div style={{ flexGrow: 1, paddingLeft: '4px' }}>
                      <div style={{ fontWeight: 600 }}>{item.name}</div>
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>
                        Talle: {item.size} • Cant: {item.quantity}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700 }}>
                      ${(item.price * item.quantity).toLocaleString('es-AR')}
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-totals-breakdown" style={{ fontSize: '13px' }}>
                <div className="cart-total-row">
                  <span>Subtotal:</span>
                  <span>${subtotal.toLocaleString('es-AR')}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="cart-total-row" style={{ color: '#15803d' }}>
                    <span>Cupón ({coupon?.code}):</span>
                    <span>-${discountAmount.toLocaleString('es-AR')}</span>
                  </div>
                )}
                {paymentMethod === 'transferencia' && transferDiscountAmount > 0 && (
                  <div className="cart-total-row" style={{ color: '#15803d' }}>
                    <span>15% OFF Transferencia:</span>
                    <span>-${transferDiscountAmount.toLocaleString('es-AR')}</span>
                  </div>
                )}
                <div className="cart-total-row">
                  <span>Envío:</span>
                  <span>
                    {shippingCost === 0 ? (
                      <strong style={{ color: '#15803d' }}>¡GRATIS!</strong>
                    ) : (
                      `$${shippingCost.toLocaleString('es-AR')}`
                    )}
                  </span>
                </div>
                <div className="cart-total-row final">
                  <span>Total Final:</span>
                  <span>${finalTotal.toLocaleString('es-AR')}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
