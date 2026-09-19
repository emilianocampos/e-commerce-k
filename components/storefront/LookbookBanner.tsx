'use client';

/* ==========================================================================
   TuTienda - Lookbook Banner Component (Fully Customizable)
   ========================================================================== */

import React, { useEffect, useState } from 'react';
import { LookbookSettings } from '../../lib/types';
import { getSettings } from '../../lib/supabaseClient';

interface LookbookBannerProps {
  lookbook?: LookbookSettings;
  onSelectCategory?: (slug: string) => void;
  onExplore?: () => void;
}

const DEFAULT_LOOKBOOK: LookbookSettings = {
  tag: 'Comprá el Outfit',
  title: 'TuTienda Streetwear Lookbook',
  description:
    'Diseñamos siluetas amplias, texturas de alto gramaje y calces relajados pensados para el uso diario sin perder la vanguardia de la moda contemporánea.',
  buttonText: 'VER LOOKS COMPLETOS',
  categoryLink: 'pantalones',
  image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop'
};

export default function LookbookBanner({ lookbook: initialLookbook, onSelectCategory, onExplore }: LookbookBannerProps) {
  const [data, setData] = useState<LookbookSettings>(initialLookbook || DEFAULT_LOOKBOOK);

  useEffect(() => {
    if (initialLookbook) {
      setData(initialLookbook);
      return;
    }

    const loadLookbook = async () => {
      const s = await getSettings();
      if (s?.lookbook) {
        setData(s.lookbook);
      }
    };

    loadLookbook();

    const handleUpdate = () => loadLookbook();
    window.addEventListener('tutienda_store_change', handleUpdate);
    window.addEventListener('moscu_store_change', handleUpdate);
    return () => {
      window.removeEventListener('tutienda_store_change', handleUpdate);
      window.removeEventListener('moscu_store_change', handleUpdate);
    };
  }, [initialLookbook]);

  return (
    <section className="lookbook-banner-section" id="lookbook" aria-label="Editorial Lookbook">
      <div className="lookbook-card">
        <img
          src={data.image || DEFAULT_LOOKBOOK.image}
          alt={data.title}
          className="lookbook-img"
          loading="lazy"
        />
        <div className="lookbook-content">
          <div className="lookbook-tag">{data.tag}</div>
          <h2 className="lookbook-title">{data.title}</h2>
          <p className="lookbook-desc">{data.description}</p>
          <button
            type="button"
            className="hero-cta-btn"
            onClick={() =>
              onExplore
                ? onExplore()
                : onSelectCategory && onSelectCategory(data.categoryLink || 'todos')
            }
          >
            {data.buttonText || 'VER LOOKS COMPLETOS'}
          </button>
        </div>
      </div>
    </section>
  );
}
