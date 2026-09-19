'use client';

/* ==========================================================================
   TuTienda - Trust Badges & Value Propositions (Fully Customizable)
   ========================================================================== */

import React, { useEffect, useState } from 'react';
import { TrustBadgeItem } from '../../lib/types';
import { getSettings } from '../../lib/supabaseClient';

interface TrustBadgesProps {
  badges?: TrustBadgeItem[];
}

const DEFAULT_BADGES: TrustBadgeItem[] = [
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
];

export default function TrustBadges({ badges: initialBadges }: TrustBadgesProps) {
  const [badges, setBadges] = useState<TrustBadgeItem[]>(initialBadges || DEFAULT_BADGES);

  useEffect(() => {
    if (initialBadges && initialBadges.length > 0) {
      setBadges(initialBadges);
      return;
    }

    const loadBadges = async () => {
      const s = await getSettings();
      if (s?.trustBadges && s.trustBadges.length > 0) {
        setBadges(s.trustBadges);
      }
    };

    loadBadges();

    const handleUpdate = () => loadBadges();
    window.addEventListener('tutienda_store_change', handleUpdate);
    window.addEventListener('moscu_store_change', handleUpdate);
    return () => {
      window.removeEventListener('tutienda_store_change', handleUpdate);
      window.removeEventListener('moscu_store_change', handleUpdate);
    };
  }, [initialBadges]);

  const renderIcon = (iconType: string) => {
    switch (iconType) {
      case 'credit-card':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
            <line x1="1" y1="10" x2="23" y2="10"></line>
          </svg>
        );
      case 'dollar':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path>
            <line x1="12" y1="6" x2="12" y2="8"></line>
            <line x1="12" y1="16" x2="12" y2="18"></line>
          </svg>
        );
      case 'map-pin':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        );
      case 'truck':
      default:
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="3" width="15" height="13"></rect>
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
            <circle cx="5.5" cy="18.5" r="2.5"></circle>
            <circle cx="18.5" cy="18.5" r="2.5"></circle>
          </svg>
        );
    }
  };

  return (
    <section className="trust-badges-section" aria-label="Beneficios de compra">
      <div className="trust-badges-grid">
        {badges.map((b, idx) => (
          <div key={b.id || idx} className="trust-badge-card">
            <div className="trust-badge-icon">
              {renderIcon(b.icon)}
            </div>
            <div>
              <div className="trust-badge-title">{b.title}</div>
              <div className="trust-badge-sub">{b.subtitle}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
