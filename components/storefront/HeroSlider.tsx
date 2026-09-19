'use client';

/* ==========================================================================
   Moscú Showroom - Hero Carousel Slider
   ========================================================================== */

import React, { useState, useEffect } from 'react';
import { getHeroSlides } from '../../lib/supabaseClient';
import { HeroSlide } from '../../lib/types';

interface HeroSliderProps {
  onSelectCategory?: (slug: string) => void;
}

export default function HeroSlider({ onSelectCategory }: HeroSliderProps) {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    getHeroSlides().then(setSlides);
  }, []);

  // Autoplay
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  const prevSlide = () => {
    setActiveIndex(prev => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setActiveIndex(prev => (prev + 1) % slides.length);
  };

  return (
    <section className="hero-carousel-section" aria-label="Campañas Destacadas">
      <div className="hero-slider">
        {slides.map((slide, idx) => (
          <div
            key={slide.id || idx}
            className={`hero-slide ${idx === activeIndex ? 'active' : ''}`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="hero-slide-bg"
              loading={idx === 0 ? 'eager' : 'lazy'}
            />
            <div className="hero-slide-overlay">
              <div className="hero-slide-content">
                <h2 className="hero-slide-title">{slide.title}</h2>
                {slide.subtitle && (
                  <p className="hero-slide-subtitle">{slide.subtitle}</p>
                )}
                <button
                  type="button"
                  className="hero-cta-btn"
                  onClick={() => onSelectCategory && onSelectCategory(slide.categoryLink)}
                >
                  <span>{slide.buttonText}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <button
        type="button"
        className="hero-slider-arrow hero-slider-prev"
        onClick={prevSlide}
        aria-label="Slide anterior"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <button
        type="button"
        className="hero-slider-arrow hero-slider-next"
        onClick={nextSlide}
        aria-label="Slide siguiente"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>

      {/* Bullets */}
      <div className="hero-slider-bullets">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            className={`hero-bullet ${idx === activeIndex ? 'active' : ''}`}
            onClick={() => setActiveIndex(idx)}
            aria-label={`Ir al slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
