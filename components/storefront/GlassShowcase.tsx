'use client';

/* ==========================================================================
   MiTienda Showroom - Glassmorphic Showcase Section ("SIX DIFFERENT IDEAS")
   Fidelity reproduction of the user-provided glassmorphic design reference
   ========================================================================== */

import React, { useState } from 'react';

interface ShowcaseItem {
  number: string;
  title?: string;
  description: string;
  badge?: string;
}

const SOLAR_ITEMS: ShowcaseItem[] = [
  {
    number: '01',
    title: 'Mercury',
    description: 'Mercury is the smallest planet in the Solar System'
  },
  {
    number: '02',
    title: 'Venus',
    description: 'Venus is the second planet from the Sun'
  },
  {
    number: '03',
    title: 'Mars',
    description: 'Despite being red, Mars is actually a cold place'
  },
  {
    number: '04',
    title: 'Jupiter',
    description: 'Jupiter is the biggest planet in the Solar System'
  },
  {
    number: '05',
    title: 'Saturn',
    description: 'Saturn is composed of hydrogen and helium'
  },
  {
    number: '06',
    title: 'Neptune',
    description: 'Neptune is the farthest planet from the Sun'
  }
];

const STREETWEAR_ITEMS: ShowcaseItem[] = [
  {
    number: '01',
    title: 'Tejido Heavy 13oz',
    description: 'Algodón rústico pesado con caída limpia y estructura arquitectónica oversize.'
  },
  {
    number: '02',
    title: 'Corte Baggy & Boxy',
    description: 'Proporciones contemporáneas inspiradas en la silueta urbana europea.'
  },
  {
    number: '03',
    title: 'Lavados Exclusivos',
    description: 'Acid wash y vintage fade artesanal con tintes no invasivos de alta durabilidad.'
  },
  {
    number: '04',
    title: 'Costuras Reforzadas',
    description: 'Doble puntada de seguridad industrial pensada para resistir el uso diario continuo.'
  },
  {
    number: '05',
    title: 'Tirada Limitada Drop 41',
    description: 'Cada tanda cuenta con número de serie único; prendas de colección nunca repetidas.'
  },
  {
    number: '06',
    title: 'Packaging Sellado',
    description: 'Envío en bolsa aluminizada hermética con stickers holográficos de autenticidad.'
  }
];

interface GlassShowcaseProps {
  onExplore?: () => void;
}

export default function GlassShowcase({ onExplore }: GlassShowcaseProps) {
  const [activeTab, setActiveTab] = useState<'solar' | 'streetwear'>('solar');

  const items = activeTab === 'solar' ? SOLAR_ITEMS : STREETWEAR_ITEMS;

  return (
    <section className="glass-showcase-section" id="glass-showcase">
      {/* Deep Crimson Ambient Atmospheric Glows */}
      <div className="glass-ambient-glow glow-left" />
      <div className="glass-ambient-glow glow-center" />
      <div className="glass-ambient-glow glow-accent" />

      <div className="glass-showcase-container">
        {/* Main Frosted Glass Card Frame */}
        <div className="glass-main-card">
          {/* Layered Glass Pill Element - Top Left Specular Layer */}
          <div className="glass-layer-pill-top" aria-hidden="true">
            <div className="glass-layer-pill-inner" />
          </div>

          {/* Layered Glass Pill Element - Bottom Left Accent Bar */}
          <div className="glass-layer-pill-bottom" aria-hidden="true" />

          {/* Header Area with Techno Expanded Typography */}
          <div className="glass-card-header">
            {/* Interactive Concept Switcher Buttons */}
            <div className="glass-tabs-group">
              <button
                type="button"
                className={`glass-tab-btn ${activeTab === 'solar' ? 'active' : ''}`}
                onClick={() => setActiveTab('solar')}
              >
                <span className="glass-tab-dot" />
                SIX IDEAS (ORIGINAL)
              </button>
              <button
                type="button"
                className={`glass-tab-btn ${activeTab === 'streetwear' ? 'active' : ''}`}
                onClick={() => setActiveTab('streetwear')}
              >
                <span className="glass-tab-dot" />
                DROP 41 PILLARS
              </button>
            </div>

            {/* Signature Title from Reference Image */}
            <div className="glass-title-block">
              <h2 className="glass-techno-title">
                <span>SIX DIFFERENT</span>
                <span className="glass-title-break">IDEAS</span>
              </h2>
            </div>
          </div>

          {/* 6 Ideas Grid (2 Rows x 3 Columns) */}
          <div className="glass-ideas-grid">
            {items.map((item) => (
              <div key={item.number} className="glass-idea-card">
                <div className="glass-idea-number-wrap">
                  <span className="glass-idea-number">{item.number}</span>
                  <div className="glass-number-accent" />
                </div>
                {item.title && (
                  <h4 className="glass-idea-heading">{item.title}</h4>
                )}
                <p className="glass-idea-text">{item.description}</p>
              </div>
            ))}
          </div>

          {/* Glassmorphic Actions / Buttons Showcase */}
          <div className="glass-card-footer">
            <div className="glass-footer-info">
              <span className="glass-live-indicator">
                <span className="glass-ping" />
                <span className="glass-dot" />
                DISEÑO GLASSMORFICO DE ALTA DEFINICIÓN
              </span>
            </div>

            <div className="glass-buttons-row">
              <button
                type="button"
                className="btn-glass-secondary"
                onClick={() => {
                  const elem = document.getElementById('seccion-drop');
                  if (elem) elem.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span>VER DROP 41</span>
              </button>

              <button
                type="button"
                className="btn-glass-primary"
                onClick={() => {
                  if (onExplore) {
                    onExplore();
                  } else {
                    const elem = document.getElementById('productos');
                    if (elem) elem.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <span>EXPLORAR CATÁLOGO</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
