'use client';

/* ==========================================================================
   Moscú Showroom - Admin Banners & CMS Page (Next.js App Router)
   ========================================================================== */

import React, { useState, useEffect } from 'react';
import AdminTopbar from '../../../components/admin/AdminTopbar';
import {
  getHeroSlides,
  saveHeroSlides,
  getAnnouncements,
  saveAnnouncements,
  uploadImage
} from '../../../lib/supabaseClient';
import { HeroSlide } from '../../../lib/types';

export default function AdminBannersPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [announcements, setAnnouncements] = useState<string[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
  const [editingSlideIndex, setEditingSlideIndex] = useState<number | null>(null);

  // Slide form fields
  const [slideTitle, setSlideTitle] = useState('');
  const [slideSubtitle, setSlideSubtitle] = useState('');
  const [slideBtnText, setSlideBtnText] = useState('VER COLECCIÓN');
  const [slideCategory, setSlideCategory] = useState('drop-41');
  const [slideImage, setSlideImage] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const loadData = async () => {
    const [s, a] = await Promise.all([getHeroSlides(), getAnnouncements()]);
    setSlides(s);
    setAnnouncements(a);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Announcements CMS
  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.trim()) return;
    const updated = [...announcements, newAnnouncement.trim().toUpperCase()];
    setAnnouncements(updated);
    await saveAnnouncements(updated);
    setNewAnnouncement('');
  };

  const handleRemoveAnnouncement = async (index: number) => {
    const updated = announcements.filter((_, i) => i !== index);
    setAnnouncements(updated);
    await saveAnnouncements(updated);
  };

  // Slides CMS
  const handleOpenAddSlide = () => {
    setEditingSlideIndex(null);
    setSlideTitle('');
    setSlideSubtitle('');
    setSlideBtnText('EXPLORAR DROP');
    setSlideCategory('drop-41');
    setSlideImage('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1920&auto=format&fit=crop');
    setIsSlideModalOpen(true);
  };

  const handleOpenEditSlide = (slide: HeroSlide, index: number) => {
    setEditingSlideIndex(index);
    setSlideTitle(slide.title);
    setSlideSubtitle(slide.subtitle || '');
    setSlideBtnText(slide.buttonText);
    setSlideCategory(slide.categoryLink);
    setSlideImage(slide.image);
    setIsSlideModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadImage(file);
      setSlideImage(url);
    } catch (err) {
      alert('Error al subir la imagen');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slideTitle || !slideImage) return;

    const newSlideObj: HeroSlide = {
      id: editingSlideIndex !== null ? slides[editingSlideIndex].id : 'slide-' + Date.now(),
      title: slideTitle,
      subtitle: slideSubtitle,
      buttonText: slideBtnText,
      categoryLink: slideCategory,
      image: slideImage,
      theme: 'dark'
    };

    let updatedSlides = [...slides];
    if (editingSlideIndex !== null) {
      updatedSlides[editingSlideIndex] = newSlideObj;
    } else {
      updatedSlides.push(newSlideObj);
    }

    setSlides(updatedSlides);
    await saveHeroSlides(updatedSlides);
    setIsSlideModalOpen(false);
  };

  const handleDeleteSlide = async (index: number) => {
    if (window.confirm('¿Estás seguro de eliminar este slide del carrusel?')) {
      const updated = slides.filter((_, i) => i !== index);
      setSlides(updated);
      await saveHeroSlides(updated);
    }
  };

  return (
    <div>
      <AdminTopbar
        title="Banners & CMS de Portada"
        ctaText="+ Nuevo Slide Hero"
        onCtaClick={handleOpenAddSlide}
      />

      <div style={{ padding: '24px 30px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* 1. ANNOUNCEMENT TICKER CMS */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">Barra Superior de Avisos (Red Marquee Ticker)</h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                Mensajes promocionales que recorren la marquesina roja en la parte superior de la tienda.
              </p>
            </div>
          </div>

          <form onSubmit={handleAddAnnouncement} style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <input
              type="text"
              className="admin-form-input"
              placeholder="Escribí un aviso (ej: 15% OFF TRANSFERENCIA BANCARIA)..."
              value={newAnnouncement}
              onChange={(e) => setNewAnnouncement(e.target.value)}
            />
            <button type="submit" className="btn-admin-cta" style={{ flexShrink: 0 }}>
              + Agregar Aviso
            </button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {announcements.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#fff1f2',
                  border: '1px solid #fecdd3',
                  padding: '10px 14px',
                  borderRadius: '4px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: '#ff0000', fontWeight: 800 }}>•</span>
                  <span style={{ fontWeight: 700, fontSize: '13px', color: '#9f1239' }}>{msg}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveAnnouncement(idx)}
                  className="btn-table-action danger"
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 2. HERO SLIDES MANAGER */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">Carrusel Principal (Hero Slider)</h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                Imágenes de campaña panorámicas, títulos y enlaces directos a las colecciones.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {slides.map((slide, idx) => (
              <div
                key={slide.id || idx}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  background: '#ffffff'
                }}
              >
                <div style={{ height: '140px', position: 'relative' }}>
                  <img
                    src={slide.image}
                    alt={slide.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      background: 'rgba(0,0,0,0.7)',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}
                  >
                    Slide #{idx + 1}
                  </span>
                </div>
                <div style={{ padding: '14px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '4px' }}>{slide.title}</h4>
                  <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px', height: '34px', overflow: 'hidden' }}>
                    {slide.subtitle || 'Sin bajada de texto'}
                  </p>
                  <div style={{ fontSize: '11px', color: '#0f172a', marginBottom: '12px' }}>
                    Enlace: <strong>#{slide.categoryLink}</strong> • Botón: <strong>{slide.buttonText}</strong>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      className="btn-table-action"
                      style={{ flexGrow: 1 }}
                      onClick={() => handleOpenEditSlide(slide, idx)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="btn-table-action danger"
                      onClick={() => handleDeleteSlide(idx)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Slide Modal */}
      {isSlideModalOpen && (
        <div className="admin-modal-overlay active" onClick={() => setIsSlideModalOpen(false)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="admin-modal-header">
              <h3>{editingSlideIndex !== null ? 'Editar Slide Hero' : 'Nuevo Slide Hero'}</h3>
              <button type="button" className="cart-close-btn" onClick={() => setIsSlideModalOpen(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleSaveSlide} style={{ padding: '20px' }}>
              <div className="admin-form-group">
                <label className="admin-form-label">Título Principal *</label>
                <input
                  type="text"
                  className="admin-form-input"
                  required
                  placeholder="ej: NUEVA COLECCIÓN DROP 41"
                  value={slideTitle}
                  onChange={(e) => setSlideTitle(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Bajada / Subtítulo</label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="ej: Siluetas oversize, denim pesado y terminaciones artesanales."
                  value={slideSubtitle}
                  onChange={(e) => setSlideSubtitle(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label">Texto del Botón</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={slideBtnText}
                    onChange={(e) => setSlideBtnText(e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Colección a Enlazar</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="drop-41, pantalones"
                    value={slideCategory}
                    onChange={(e) => setSlideCategory(e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Foto Panorámica del Slide</label>
                <input
                  type="url"
                  className="admin-form-input"
                  placeholder="https://images.unsplash.com/..."
                  value={slideImage}
                  onChange={(e) => setSlideImage(e.target.value)}
                  style={{ marginBottom: '8px' }}
                />

                <label className="admin-image-upload-box">
                  <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                    {isUploading ? 'Subiendo imagen...' : 'O subí una foto desde tu dispositivo'}
                  </div>
                </label>

                {slideImage && (
                  <img
                    src={slideImage}
                    alt="Preview"
                    style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '4px', marginTop: '10px' }}
                  />
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn-table-action" onClick={() => setIsSlideModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-admin-cta">
                  Guardar Slide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
