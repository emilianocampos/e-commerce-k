'use client';

/* ==========================================================================
   Moscú Showroom - Visual Category Showcase Cards
   ========================================================================== */

import React from 'react';

interface CategoryCardsProps {
  onSelectCategory?: (slug: string) => void;
}

export default function CategoryCards({ onSelectCategory }: CategoryCardsProps) {
  const visualCategories = [
    {
      name: 'PANTALONES & CARGOS',
      slug: 'pantalones',
      image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=700&auto=format&fit=crop'
    },
    {
      name: 'HOODIES & BUZOS',
      slug: 'hoodies',
      image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=700&auto=format&fit=crop'
    },
    {
      name: 'REMERAS OVERSIZE',
      slug: 'remeras',
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=700&auto=format&fit=crop'
    },
    {
      name: 'LIQUIDACIÓN ORIGINALS',
      slug: 'liquidacion',
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=700&auto=format&fit=crop'
    }
  ];

  return (
    <section className="categories-showcase-section" aria-label="Categorías Destacadas">
      <div className="categories-visual-grid">
        {visualCategories.map(cat => (
          <a
            key={cat.slug}
            href="#productos"
            className="cat-visual-card"
            onClick={(e) => {
              e.preventDefault();
              if (onSelectCategory) onSelectCategory(cat.slug);
            }}
          >
            <img src={cat.image} alt={cat.name} className="cat-visual-img" loading="lazy" />
            <div className="cat-visual-overlay">
              <h3 className="cat-visual-name">{cat.name}</h3>
              <span className="cat-visual-action">VER COLECCIÓN →</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
