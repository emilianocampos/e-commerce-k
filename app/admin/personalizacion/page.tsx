'use client';

/* ==========================================================================
   TuTienda - Admin Personalization & Appearance Module (Next.js App Router)
   ========================================================================== */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminTopbar from '../../../components/admin/AdminTopbar';
import { getSettings, saveSettings } from '../../../lib/supabaseClient';
import { StoreSettings, TrustBadgeItem, LookbookSettings, MercadoPagoSettings } from '../../../lib/types';
import { INITIAL_SETTINGS } from '../../../js/data';

export default function PersonalizacionPage() {
  const [activeTab, setActiveTab] = useState<'apariencia' | 'marca' | 'badges' | 'lookbook' | 'mercadopago' | 'banco'>('apariencia');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form State
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'auto'>('light');
  const [enableGlassmorphism, setEnableGlassmorphism] = useState<boolean>(true);
  const [primaryColor, setPrimaryColor] = useState<string>('#000000');
  const [adbarColor, setAdbarColor] = useState<string>('#ff0000');

  const [storeName, setStoreName] = useState<string>('TuTienda');
  const [storeTagline, setStoreTagline] = useState<string>('SHOWROOM • MODA URBANA');
  const [phoneWhatsapp, setPhoneWhatsapp] = useState<string>('5492494123456');
  const [showroomAddress, setShowroomAddress] = useState<string>('9 de Julio 837, Ayacucho, Provincia de Buenos Aires');

  const [cuotasSinInteres, setCuotasSinInteres] = useState<number>(6);
  const [transferDiscountPct, setTransferDiscountPct] = useState<number>(15);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(150000);

  // 4 Trust Badges (Matching Image 1)
  const [trustBadges, setTrustBadges] = useState<TrustBadgeItem[]>([
    {
      id: 'badge-1',
      title: 'Envíos a todo el país',
      subtitle: 'Correo Argentino & Andreani. Gratis superando $150.000',
      icon: 'truck'
    },
    {
      id: 'badge-2',
      title: 'Hasta 6 Cuotas Sin Interés',
      subtitle: 'Con todas las tarjetas bancarias mediante Mercado Pago',
      icon: 'credit-card'
    },
    {
      id: 'badge-3',
      title: '15% OFF Transferencia',
      subtitle: 'Descuento automático pagando por transferencia bancaria',
      icon: 'dollar'
    },
    {
      id: 'badge-4',
      title: 'Showroom en Ayacucho',
      subtitle: '9 de Julio 837. Retirá tus pedidos online sin costo',
      icon: 'map-pin'
    }
  ]);

  // Lookbook
  const [lookbook, setLookbook] = useState<LookbookSettings>({
    tag: 'Comprá el Outfit',
    title: 'TuTienda Streetwear Lookbook',
    description: 'Diseñamos siluetas amplias, texturas de alto gramaje y calces relajados pensados para el uso diario sin perder la vanguardia.',
    buttonText: 'VER LOOKS COMPLETOS',
    categoryLink: 'pantalones',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop'
  });

  // Mercado Pago
  const [mercadoPago, setMercadoPago] = useState<MercadoPagoSettings>({
    enabled: true,
    publicKey: 'TEST-xxxx-xxxx-xxxx',
    accessToken: 'TEST-xxxx-xxxx-xxxx',
    sandboxMode: true
  });

  // Bank Data
  const [bankTransferData, setBankTransferData] = useState({
    titular: 'TUTIENDA S.R.L.',
    cuit: '30-71829304-9',
    banco: 'Banco Galicia',
    cbu: '0070123130004019283741',
    alias: 'TUTIENDA.OFICIAL'
  });

  // Load current settings
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const s = await getSettings();
      if (s) {
        if (s.themeMode) setThemeMode(s.themeMode);
        if (s.enableGlassmorphism !== undefined) setEnableGlassmorphism(s.enableGlassmorphism);
        if (s.primaryColor) setPrimaryColor(s.primaryColor);
        if (s.adbarColor) setAdbarColor(s.adbarColor);
        if (s.storeName) setStoreName(s.storeName);
        if (s.storeTagline) setStoreTagline(s.storeTagline);
        if (s.phoneWhatsapp) setPhoneWhatsapp(s.phoneWhatsapp);
        if (s.showroomAddress) setShowroomAddress(s.showroomAddress);
        if (s.cuotasSinInteres !== undefined) setCuotasSinInteres(s.cuotasSinInteres);
        if (s.transferDiscountPct !== undefined) setTransferDiscountPct(s.transferDiscountPct);
        if (s.freeShippingThreshold !== undefined) setFreeShippingThreshold(s.freeShippingThreshold);
        if (s.trustBadges && s.trustBadges.length > 0) setTrustBadges(s.trustBadges);
        if (s.lookbook) setLookbook(s.lookbook);
        if (s.mercadoPago) setMercadoPago(s.mercadoPago);
        if (s.bankTransferData) setBankTransferData(s.bankTransferData);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleBadgeChange = (index: number, field: keyof TrustBadgeItem, value: string) => {
    setTrustBadges(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setSavedSuccess(false);

    const current = await getSettings();
    const updated: StoreSettings = {
      ...current,
      themeMode,
      enableGlassmorphism,
      primaryColor,
      adbarColor,
      storeName,
      storeTagline,
      phoneWhatsapp,
      showroomAddress,
      cuotasSinInteres,
      transferDiscountPct,
      freeShippingThreshold,
      trustBadges,
      lookbook,
      mercadoPago,
      bankTransferData
    };

    await saveSettings(updated);

    // Apply immediate theme switch in DOM
    if (themeMode === 'auto') {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', themeMode);
    }

    setSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const handleResetDefaults = async () => {
    if (confirm('¿Restaurar toda la configuración de diseño, textos y marca a los valores predeterminados de TuTienda?')) {
      await saveSettings(INITIAL_SETTINGS as StoreSettings);
      window.location.reload();
    }
  };

  return (
    <div className="admin-content-area">
      <AdminTopbar title="Módulo de Personalización & Apariencia" />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 10px 60px' }}>
        {/* Intro banner */}
        <div
          className="glass-card"
          style={{
            padding: '24px',
            borderRadius: '16px',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#dbeafe', color: '#1d4ed8', padding: '4px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
              <span>✨ Personalización Total</span>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 6px 0' }}>
              Control Visual y Textual de {storeName}
            </h2>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
              Modificá el modo oscuro/claro, sombras, efecto glassmorphism, frases de banners, los 4 badges de confianza, Mercado Pago y datos bancarios.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link
              href="/"
              target="_blank"
              className="admin-btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              👁️ Ver Tienda
            </Link>
            <button
              type="button"
              className="admin-btn-primary"
              onClick={handleSaveAll}
              disabled={saving}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              {saving ? 'Guardando...' : '💾 Guardar Todo'}
            </button>
          </div>
        </div>

        {/* Save Toast Notification */}
        {savedSuccess && (
          <div
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              background: '#16a34a',
              color: '#ffffff',
              padding: '14px 22px',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(22, 163, 74, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              zIndex: 99999,
              fontWeight: 600,
              fontSize: '14px',
              animation: 'slideUp 0.3s ease-out'
            }}
          >
            <span>✅ ¡Cambios guardados con éxito en la tienda y base de datos!</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '12px',
            marginBottom: '20px',
            borderBottom: '1px solid #e2e8f0'
          }}
        >
          {[
            { id: 'apariencia', label: '🎨 Tema & Glassmorphism' },
            { id: 'marca', label: '🏷️ Marca & Textos' },
            { id: 'badges', label: '🛡️ 4 Badges de Confianza' },
            { id: 'lookbook', label: '📸 Editorial Lookbook' },
            { id: 'mercadopago', label: '💳 Mercado Pago' },
            { id: 'banco', label: '🏦 Datos Bancarios' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '10px 18px',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === tab.id ? '#0f172a' : '#f1f5f9',
                color: activeTab === tab.id ? '#ffffff' : '#475569',
                fontWeight: activeTab === tab.id ? 700 : 600,
                fontSize: '13px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: APARIENCIA & GLASSMORPHISM */}
        {activeTab === 'apariencia' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            <div className="admin-form-card" style={{ padding: '24px', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
                Modo Visual (Claro / Oscuro)
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                Elegí cómo ven tus clientes el sitio web. Podés forzar modo oscuro elegante o claro moderno.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div
                  onClick={() => setThemeMode('light')}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: `2px solid ${themeMode === 'light' ? '#2563eb' : '#e2e8f0'}`,
                    background: '#ffffff',
                    color: '#0f172a',
                    textAlign: 'center',
                    cursor: 'pointer',
                    boxShadow: themeMode === 'light' ? '0 4px 12px rgba(37, 99, 235, 0.15)' : 'none'
                  }}
                >
                  <div style={{ fontSize: '26px', marginBottom: '6px' }}>☀️</div>
                  <div style={{ fontWeight: 700, fontSize: '13px' }}>Modo Claro</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Fresco & Clean</div>
                </div>

                <div
                  onClick={() => setThemeMode('dark')}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: `2px solid ${themeMode === 'dark' ? '#2563eb' : '#1e293b'}`,
                    background: '#090d16',
                    color: '#ffffff',
                    textAlign: 'center',
                    cursor: 'pointer',
                    boxShadow: themeMode === 'dark' ? '0 4px 12px rgba(37, 99, 235, 0.25)' : 'none'
                  }}
                >
                  <div style={{ fontSize: '26px', marginBottom: '6px' }}>🌙</div>
                  <div style={{ fontWeight: 700, fontSize: '13px' }}>Modo Oscuro</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Sleek Streetwear</div>
                </div>

                <div
                  onClick={() => setThemeMode('auto')}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: `2px solid ${themeMode === 'auto' ? '#2563eb' : '#e2e8f0'}`,
                    background: '#f8fafc',
                    color: '#334155',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: '26px', marginBottom: '6px' }}>💻</div>
                  <div style={{ fontWeight: 700, fontSize: '13px' }}>Automático</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Según dispositivo</div>
                </div>
              </div>

              {/* Glassmorphism toggle */}
              <div
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <strong style={{ display: 'block', fontSize: '14px' }}>✨ Efecto Vidrio Esmerilado (Glassmorphism)</strong>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    Aplica fondos traslúcidos con filtro blur (16px) en cabecera, tarjetas flotantes y carrito.
                  </span>
                </div>
                <input
                  type="checkbox"
                  id="glassmorphismToggle"
                  checked={enableGlassmorphism}
                  onChange={(e) => setEnableGlassmorphism(e.target.checked)}
                  style={{ width: '22px', height: '22px', cursor: 'pointer' }}
                />
              </div>
            </div>

            {/* Colors */}
            <div className="admin-form-card" style={{ padding: '24px', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
                Colores Principales
              </h3>

              <div style={{ marginBottom: '18px' }}>
                <label className="admin-form-label">Color de Barra de Anuncios (Marquee Ticker):</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={adbarColor}
                    onChange={(e) => setAdbarColor(e.target.value)}
                    style={{ width: '45px', height: '40px', padding: 0, border: 'none', cursor: 'pointer', borderRadius: '6px' }}
                  />
                  <input
                    type="text"
                    className="admin-form-input"
                    value={adbarColor}
                    onChange={(e) => setAdbarColor(e.target.value)}
                    placeholder="#ff0000"
                    style={{ fontFamily: 'monospace' }}
                  />
                </div>
                <small style={{ fontSize: '11px', color: '#64748b' }}>Color del carrusel rojo superior que muestra promociones y cuotas.</small>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label className="admin-form-label">Color Botones / Acento Primario:</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    style={{ width: '45px', height: '40px', padding: 0, border: 'none', cursor: 'pointer', borderRadius: '6px' }}
                  />
                  <input
                    type="text"
                    className="admin-form-input"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    placeholder="#000000"
                    style={{ fontFamily: 'monospace' }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MARCA & TEXTOS GLOBALES */}
        {activeTab === 'marca' && (
          <div className="admin-form-card" style={{ padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
              Identidad de Marca & Datos de la Tienda
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label className="admin-form-label">Nombre de la Tienda (Brand Logo):</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="TuTienda"
                />
                <small style={{ fontSize: '11px', color: '#64748b' }}>Aparece en el centro del header, footer y notificaciones.</small>
              </div>

              <div>
                <label className="admin-form-label">Eslogan o Subtítulo del Logo:</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={storeTagline}
                  onChange={(e) => setStoreTagline(e.target.value)}
                  placeholder="SHOWROOM • MODA URBANA"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label className="admin-form-label">Teléfono / WhatsApp de Atención:</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={phoneWhatsapp}
                  onChange={(e) => setPhoneWhatsapp(e.target.value)}
                  placeholder="5492494123456"
                />
                <small style={{ fontSize: '11px', color: '#64748b' }}>Con código de país y de área (ej: 5492494123456).</small>
              </div>

              <div>
                <label className="admin-form-label">Dirección del Showroom / Local:</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={showroomAddress}
                  onChange={(e) => setShowroomAddress(e.target.value)}
                  placeholder="9 de Julio 837, Ayacucho, Provincia de Buenos Aires"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label className="admin-form-label">Cuotas Sin Interés:</label>
                <input
                  type="number"
                  className="admin-form-input"
                  value={cuotasSinInteres}
                  onChange={(e) => setCuotasSinInteres(Number(e.target.value))}
                  min={1}
                  max={24}
                />
              </div>
              <div>
                <label className="admin-form-label">% Descuento por Transferencia:</label>
                <input
                  type="number"
                  className="admin-form-input"
                  value={transferDiscountPct}
                  onChange={(e) => setTransferDiscountPct(Number(e.target.value))}
                  min={0}
                  max={90}
                />
              </div>
              <div>
                <label className="admin-form-label">Monto Mínimo Envío Gratis ($):</label>
                <input
                  type="number"
                  className="admin-form-input"
                  value={freeShippingThreshold}
                  onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                  min={0}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: 4 BADGES DE CONFIANZA (IMAGEN 1) */}
        {activeTab === 'badges' && (
          <div className="admin-form-card" style={{ padding: '24px', borderRadius: '16px' }}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 6px 0' }}>
                Los 4 Badges de Confianza de la Tienda (Imagen 1)
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                Personalizá libremente los títulos, subtítulos e iconos de los 4 pilares visibles debajo del carrusel de inicio.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              {trustBadges.map((badge, index) => (
                <div
                  key={badge.id || index}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontWeight: 700, fontSize: '12px', color: '#2563eb' }}>
                      Badge #{index + 1}
                    </span>
                    <select
                      className="admin-form-input"
                      style={{ width: 'auto', padding: '4px 8px', fontSize: '12px' }}
                      value={badge.icon}
                      onChange={(e) => handleBadgeChange(index, 'icon', e.target.value)}
                    >
                      <option value="truck">🚚 Camión / Envíos</option>
                      <option value="credit-card">💳 Tarjeta / Cuotas</option>
                      <option value="dollar">💰 Dólar / Descuento</option>
                      <option value="map-pin">📍 Ubicación / Showroom</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '10px' }}>
                    <label className="admin-form-label" style={{ fontSize: '11px' }}>Título Principal:</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={badge.title}
                      onChange={(e) => handleBadgeChange(index, 'title', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="admin-form-label" style={{ fontSize: '11px' }}>Subtítulo / Aclaración:</label>
                    <textarea
                      className="admin-form-input"
                      rows={2}
                      value={badge.subtitle}
                      onChange={(e) => handleBadgeChange(index, 'subtitle', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: LOOKBOOK EDITORIAL */}
        {activeTab === 'lookbook' && (
          <div className="admin-form-card" style={{ padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
              Sección Lookbook Editorial (&quot;Comprá el Outfit&quot;)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label className="admin-form-label">Etiqueta Superior:</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={lookbook.tag}
                  onChange={(e) => setLookbook({ ...lookbook, tag: e.target.value })}
                  placeholder="Comprá el Outfit"
                />
              </div>

              <div>
                <label className="admin-form-label">Título Principal:</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={lookbook.title}
                  onChange={(e) => setLookbook({ ...lookbook, title: e.target.value })}
                  placeholder="TuTienda Streetwear Lookbook"
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label className="admin-form-label">Descripción:</label>
              <textarea
                className="admin-form-input"
                rows={3}
                value={lookbook.description}
                onChange={(e) => setLookbook({ ...lookbook, description: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label className="admin-form-label">Texto del Botón:</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={lookbook.buttonText}
                  onChange={(e) => setLookbook({ ...lookbook, buttonText: e.target.value })}
                  placeholder="VER LOOKS COMPLETOS"
                />
              </div>

              <div>
                <label className="admin-form-label">Categoría Destino (Slug):</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={lookbook.categoryLink}
                  onChange={(e) => setLookbook({ ...lookbook, categoryLink: e.target.value })}
                  placeholder="pantalones"
                />
              </div>
            </div>

            <div>
              <label className="admin-form-label">URL de la Imagen:</label>
              <input
                type="text"
                className="admin-form-input"
                value={lookbook.image}
                onChange={(e) => setLookbook({ ...lookbook, image: e.target.value })}
              />
              {lookbook.image && (
                <div style={{ marginTop: '12px' }}>
                  <img
                    src={lookbook.image}
                    alt="Preview Lookbook"
                    style={{ width: '200px', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: MERCADO PAGO */}
        {activeTab === 'mercadopago' && (
          <div className="admin-form-card" style={{ padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px 0' }}>
                  Integración con Mercado Pago (Argentina)
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                  Cobrá con tarjetas de crédito, débito y dinero en cuenta de Mercado Pago con acreditación instantánea.
                </p>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <span style={{ fontSize: '13px', fontWeight: 700 }}>Habilitado:</span>
                <input
                  type="checkbox"
                  checked={mercadoPago.enabled}
                  onChange={(e) => setMercadoPago({ ...mercadoPago, enabled: e.target.checked })}
                  style={{ width: '20px', height: '20px' }}
                />
              </label>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label className="admin-form-label">Public Key (Clave Pública):</label>
              <input
                type="text"
                className="admin-form-input"
                value={mercadoPago.publicKey}
                onChange={(e) => setMercadoPago({ ...mercadoPago, publicKey: e.target.value })}
                placeholder="APP_USR-xxxxxx o TEST-xxxxxx"
                style={{ fontFamily: 'monospace' }}
              />
              <small style={{ fontSize: '11px', color: '#64748b' }}>Disponible en tu panel de desarrolladores de Mercado Pago.</small>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label className="admin-form-label">Access Token (Token de Acceso Privado):</label>
              <input
                type="password"
                className="admin-form-input"
                value={mercadoPago.accessToken}
                onChange={(e) => setMercadoPago({ ...mercadoPago, accessToken: e.target.value })}
                placeholder="APP_USR-xxxxxx o TEST-xxxxxx"
                style={{ fontFamily: 'monospace' }}
              />
            </div>

            <div style={{ padding: '14px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={mercadoPago.sandboxMode}
                  onChange={(e) => setMercadoPago({ ...mercadoPago, sandboxMode: e.target.checked })}
                  style={{ width: '18px', height: '18px' }}
                />
                <span style={{ fontSize: '13px', fontWeight: 600 }}>
                  🧪 Modo Pruebas (Sandbox) activo (usar tarjetas de prueba de Mercado Pago)
                </span>
              </label>
            </div>
          </div>
        )}

        {/* TAB 6: DATOS BANCARIOS */}
        {activeTab === 'banco' && (
          <div className="admin-form-card" style={{ padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
              Datos de Cuenta Bancaria para Transferencias (15% OFF)
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
              Estos datos se muestran automáticamente al cliente en el paso final del Checkout y en el comprobante.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label className="admin-form-label">Titular de la Cuenta:</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={bankTransferData.titular}
                  onChange={(e) => setBankTransferData({ ...bankTransferData, titular: e.target.value })}
                  placeholder="TUTIENDA S.R.L."
                />
              </div>

              <div>
                <label className="admin-form-label">Banco:</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={bankTransferData.banco}
                  onChange={(e) => setBankTransferData({ ...bankTransferData, banco: e.target.value })}
                  placeholder="Banco Galicia"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label className="admin-form-label">CBU / CVU:</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={bankTransferData.cbu}
                  onChange={(e) => setBankTransferData({ ...bankTransferData, cbu: e.target.value })}
                  placeholder="0070123130004019283741"
                  style={{ fontFamily: 'monospace' }}
                />
              </div>

              <div>
                <label className="admin-form-label">Alias:</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={bankTransferData.alias}
                  onChange={(e) => setBankTransferData({ ...bankTransferData, alias: e.target.value })}
                  placeholder="TUTIENDA.OFICIAL"
                  style={{ fontFamily: 'monospace' }}
                />
              </div>
            </div>

            <div>
              <label className="admin-form-label">CUIT:</label>
              <input
                type="text"
                className="admin-form-input"
                value={bankTransferData.cuit}
                onChange={(e) => setBankTransferData({ ...bankTransferData, cuit: e.target.value })}
                placeholder="30-71829304-9"
              />
            </div>
          </div>
        )}

        {/* Action buttons footer */}
        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            className="admin-btn-secondary"
            onClick={handleResetDefaults}
            style={{ color: '#dc2626', borderColor: '#fca5a5' }}
          >
            ⚠️ Restaurar Valores Predeterminados
          </button>

          <button
            type="button"
            className="admin-btn-primary"
            onClick={handleSaveAll}
            disabled={saving}
            style={{ padding: '12px 28px', fontSize: '15px', fontWeight: 700 }}
          >
            {saving ? 'Guardando Cambios...' : '💾 Guardar Todos los Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}
