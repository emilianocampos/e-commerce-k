'use client';

/* ==========================================================================
   TuTienda - Announcement Bar (Marquee Ticker with Dynamic Color & Text)
   ========================================================================== */

import React, { useEffect, useState } from 'react';
import { getAnnouncements, getSettings } from '../../lib/supabaseClient';

export default function AnnouncementBar() {
  const [messages, setMessages] = useState<string[]>([
    'HASTA 6 CUOTAS SIN INTERÉS',
    '15% OFF CON TRANSFERENCIA',
    'ENVÍOS GRATIS EN COMPRAS SUPERIORES A $150.000',
    'SHOWROOM FÍSICO EN AYACUCHO - 9 DE JULIO 837'
  ]);
  const [adbarColor, setAdbarColor] = useState<string>('#ff0000');

  useEffect(() => {
    const loadBarData = async () => {
      const [announcements, settings] = await Promise.all([
        getAnnouncements(),
        getSettings()
      ]);
      if (announcements && announcements.length > 0) {
        setMessages(announcements);
      }
      if (settings?.adbarColor) {
        setAdbarColor(settings.adbarColor);
      }
    };

    loadBarData();

    const handleUpdate = () => loadBarData();
    window.addEventListener('tutienda_store_change', handleUpdate);
    window.addEventListener('moscu_store_change', handleUpdate);
    return () => {
      window.removeEventListener('tutienda_store_change', handleUpdate);
      window.removeEventListener('moscu_store_change', handleUpdate);
    };
  }, []);

  // Duplicate items for seamless continuous looping marquee
  const tickerItems = [...messages, ...messages, ...messages];

  return (
    <section
      className="section-adbar"
      style={{ backgroundColor: adbarColor }}
      aria-label="Promociones y Envíos"
    >
      <div className="adbar-ticker">
        {tickerItems.map((msg, index) => (
          <span key={index} className="adbar-item">
            {msg}
          </span>
        ))}
      </div>
    </section>
  );
}
