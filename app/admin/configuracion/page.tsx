'use client';

/* ==========================================================================
   Moscú Showroom - Admin Store Settings Page (Next.js App Router)
   ========================================================================== */

import React, { useState, useEffect } from 'react';
import AdminTopbar from '../../../components/admin/AdminTopbar';
import { getSettings, saveSettings, resetToSeedData } from '../../../lib/supabaseClient';
import { StoreSettings } from '../../../lib/types';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    await saveSettings(settings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetSeed = async () => {
    if (window.confirm('¿Deseás restaurar todos los datos a la configuración inicial semilla? Se repondrán los productos, categorías y pedidos por defecto.')) {
      await resetToSeedData();
      const updated = await getSettings();
      setSettings(updated);
      alert('Datos iniciales restablecidos con éxito.');
    }
  };

  if (!settings) {
    return <div style={{ padding: '30px' }}>Cargando configuración...</div>;
  }

  return (
    <div>
      <AdminTopbar title="Configuración de Tienda & Parámetros" />

      <div style={{ padding: '24px 30px', maxWidth: '800px' }}>
        {savedSuccess && (
          <div style={{ background: '#dcfce7', color: '#166534', padding: '12px 16px', borderRadius: '4px', marginBottom: '16px', fontWeight: 600 }}>
            ✓ ¡Configuración guardada correctamente!
          </div>
        )}

        <form onSubmit={handleSave}>
          {/* Promociones y Tarifas */}
          <div className="admin-card" style={{ marginBottom: '24px' }}>
            <div className="admin-card-header">
              <h3 className="admin-card-title">Promociones & Condiciones Comerciales</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="admin-form-group">
                <label className="admin-form-label">Cuotas Sin Interés (Mercado Pago)</label>
                <input
                  type="number"
                  className="admin-form-input"
                  value={settings.cuotasSinInteres}
                  onChange={(e) => setSettings({ ...settings, cuotasSinInteres: Number(e.target.value) })}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">% Descuento por Transferencia</label>
                <input
                  type="number"
                  className="admin-form-input"
                  value={settings.transferDiscountPct}
                  onChange={(e) => setSettings({ ...settings, transferDiscountPct: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Monto Mínimo para Envío Gratis ($ ARS)</label>
              <input
                type="number"
                className="admin-form-input"
                value={settings.freeShippingThreshold}
                onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
              />
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                Actual: compras superiores a ${settings.freeShippingThreshold.toLocaleString('es-AR')} obtienen envío sin costo.
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="admin-form-group">
                <label className="admin-form-label">Costo Correo Argentino ($)</label>
                <input
                  type="number"
                  className="admin-form-input"
                  value={settings.shippingCosts?.correoArgentino || 5500}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      shippingCosts: { ...settings.shippingCosts, correoArgentino: Number(e.target.value) }
                    })
                  }
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Costo Andreani ($)</label>
                <input
                  type="number"
                  className="admin-form-input"
                  value={settings.shippingCosts?.andreani || 7500}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      shippingCosts: { ...settings.shippingCosts, andreani: Number(e.target.value) }
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Datos Bancarios para Transferencias */}
          <div className="admin-card" style={{ marginBottom: '24px' }}>
            <div className="admin-card-header">
              <h3 className="admin-card-title">Datos Bancarios para Pago por Transferencia</h3>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Titular de la Cuenta</label>
              <input
                type="text"
                className="admin-form-input"
                value={settings.bankTransferData?.titular || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    bankTransferData: { ...settings.bankTransferData, titular: e.target.value }
                  })
                }
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="admin-form-group">
                <label className="admin-form-label">Banco</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={settings.bankTransferData?.banco || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      bankTransferData: { ...settings.bankTransferData, banco: e.target.value }
                    })
                  }
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">CUIT / CUIL</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={settings.bankTransferData?.cuit || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      bankTransferData: { ...settings.bankTransferData, cuit: e.target.value }
                    })
                  }
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
              <div className="admin-form-group">
                <label className="admin-form-label">CBU</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={settings.bankTransferData?.cbu || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      bankTransferData: { ...settings.bankTransferData, cbu: e.target.value }
                    })
                  }
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Alias</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={settings.bankTransferData?.alias || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      bankTransferData: { ...settings.bankTransferData, alias: e.target.value }
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Información del Showroom */}
          <div className="admin-card" style={{ marginBottom: '24px' }}>
            <div className="admin-card-header">
              <h3 className="admin-card-title">Información del Showroom Físico</h3>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Dirección del Showroom</label>
              <input
                type="text"
                className="admin-form-input"
                value={settings.showroomAddress}
                onChange={(e) => setSettings({ ...settings, showroomAddress: e.target.value })}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Teléfono WhatsApp de Atención</label>
              <input
                type="text"
                className="admin-form-input"
                value={settings.phoneWhatsapp}
                onChange={(e) => setSettings({ ...settings, phoneWhatsapp: e.target.value })}
              />
            </div>
          </div>

          {/* Botones de Acción */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
            <button
              type="button"
              className="btn-table-action danger"
              onClick={handleResetSeed}
            >
              🔄 Restaurar Datos Semilla
            </button>

            <button type="submit" className="btn-admin-cta" style={{ padding: '12px 28px' }}>
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
